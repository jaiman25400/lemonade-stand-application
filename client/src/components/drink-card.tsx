import { QuantityStepper } from "@/src/components/quantity-stepper";
import { formatPrice } from "@/src/lib/money";
import { resolveSelectedSize } from "@/src/cart/select-size";
import type { CartItem } from "@/src/cart/cart";
import { colors } from "@/src/theme";
import type { Beverage } from "@/src/types/api";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type DrinkCardProps = {
  beverage: Beverage;
  onAdd: (item: CartItem) => void;
};

export function DrinkCard({ beverage, onAdd }: DrinkCardProps) {
  const [sizeId, setSizeId] = useState(beverage.sizes[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scale = useSharedValue(1);
  const selectedSize = resolveSelectedSize(beverage.sizes, sizeId);
  const addStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    return () => {
      if (addedTimer.current) {
        clearTimeout(addedTimer.current);
      }
    };
  }, []);

  function handleAdd() {
    if (!selectedSize) {
      return;
    }

    onAdd({
      beverageId: beverage.id,
      beverageName: beverage.name,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      unitPrice: selectedSize.price,
      quantity,
    });
    setQuantity(1);
    setJustAdded(true);
    scale.value = withSequence(
      withTiming(0.92, { duration: 70 }),
      withSpring(1, { damping: 12, stiffness: 220 }),
    );
    if (addedTimer.current) {
      clearTimeout(addedTimer.current);
    }
    addedTimer.current = setTimeout(() => setJustAdded(false), 900);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{beverage.name}</Text>
      {beverage.sizes.length === 0 ? (
        <Text style={styles.empty}>No sizes yet</Text>
      ) : (
        <>
          {beverage.sizes.map((size) => {
            const selected = size.id === selectedSize?.id;
            return (
              <Pressable
                key={size.id}
                style={[styles.sizeRow, selected && styles.sizeRowSelected]}
                onPress={() => setSizeId(size.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${size.name}, ${formatPrice(size.price)}`}
              >
                <Text style={styles.sizeName}>{size.name}</Text>
                <Text style={styles.sizePrice}>{formatPrice(size.price)}</Text>
              </Pressable>
            );
          })}
          <View style={styles.actions}>
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <Animated.View style={addStyle}>
              <Pressable
                style={[styles.addButton, justAdded && styles.addButtonAdded]}
                onPress={handleAdd}
                accessibilityRole="button"
                accessibilityLabel={`Add ${beverage.name} to cart`}
              >
                <Text style={styles.addLabel}>
                  {justAdded ? "Added" : "Add"}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  empty: {
    fontSize: 14,
    color: colors.muted,
  },
  sizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  sizeRowSelected: {
    backgroundColor: colors.primaryMuted,
  },
  sizeName: {
    fontSize: 16,
    color: colors.text,
  },
  sizePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 88,
    alignItems: "center",
  },
  addButtonAdded: {
    backgroundColor: colors.success,
  },
  addLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});
