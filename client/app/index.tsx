import { useBeveragesQuery } from "@/src/api/hooks/use-beverages";
import { userErrorMessage } from "@/src/api/errors";
import { useCart } from "@/src/cart/cart-context";
import { CartBadge } from "@/src/components/cart-badge";
import { DrinkCard } from "@/src/components/drink-card";
import { colors } from "@/src/theme";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Index() {
  const { addItem, itemCount } = useCart();
  const navigation = useNavigation();
  const beveragesQuery = useBeveragesQuery();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <CartBadge />,
      headerRightContainerStyle: {
        justifyContent: "center",
        alignItems: "center",
        paddingRight: 8,
      },
    });
  }, [navigation, itemCount]);

  if (beveragesQuery.isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading today&apos;s drinks...</Text>
      </View>
    );
  }

  if (beveragesQuery.isError && !beveragesQuery.data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          {userErrorMessage(
            beveragesQuery.error,
            "Could not load beverages",
          )}
        </Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => void beveragesQuery.refetch()}
        >
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const beverages = beveragesQuery.data ?? [];

  return (
    <FlatList
      data={beverages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={beveragesQuery.isRefetching}
          onRefresh={() => void beveragesQuery.refetch()}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.kicker}>Today</Text>
          <Text style={styles.heading}>Drinks</Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.muted}>
          No drinks on the board yet. Add some in Swagger, then pull down to
          refresh.
        </Text>
      }
      renderItem={({ item }) => (
        <DrinkCard beverage={item} onAdd={addItem} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  list: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.primary,
  },
  muted: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    marginTop: 12,
  },
  error: {
    fontSize: 16,
    color: colors.danger,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
    maxWidth: 320,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 8,
  },
  retryLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});
