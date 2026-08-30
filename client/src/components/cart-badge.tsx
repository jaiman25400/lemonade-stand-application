import { useCart } from "@/src/cart/cart-context";
import { cartBadgeScale } from "@/src/cart/cart-badge-pulse";
import { colors } from "@/src/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const MAX_BADGE = 99;

export function CartBadge() {
  const { itemCount } = useCart();
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const iconSize = Math.round(24 * Math.min(Math.max(fontScale, 1), 1.35));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartBadgeScale.value }],
  }));
  const badgeLabel = itemCount > MAX_BADGE ? `${MAX_BADGE}+` : String(itemCount);

  return (
    <Pressable
      onPress={() => router.push("/cart")}
      accessibilityRole="button"
      accessibilityLabel={`Cart, ${itemCount} items`}
      hitSlop={12}
      style={styles.hit}
    >
      <Animated.View style={[styles.iconWrap, pulseStyle]}>
        <Ionicons name="cart-outline" size={iconSize} color={colors.primary} />
        {itemCount > 0 ? (
          <View style={styles.badge} pointerEvents="none">
            <Text style={styles.badgeLabel}>{badgeLabel}</Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    minWidth: 44,
    minHeight: 44,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrap: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    lineHeight: 14,
  },
});
