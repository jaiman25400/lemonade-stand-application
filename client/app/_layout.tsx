import { ensureApiClient } from "@/src/api/configure-client";
import { bindQueryAppState, queryClient } from "@/src/api/query-client";
import { CartProvider } from "@/src/cart/cart-context";
import { colors } from "@/src/theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

ensureApiClient();
bindQueryAppState();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.primary,
              headerTitleStyle: { fontWeight: "700", color: colors.primary },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen
              name="index"
              options={{ title: "Lemonade Stand", headerBackVisible: false }}
            />
            <Stack.Screen name="cart" options={{ title: "Cart" }} />
            <Stack.Screen
              name="confirmation"
              options={{
                title: "Confirmation",
                headerBackVisible: false,
                gestureEnabled: false,
              }}
            />
          </Stack>
        </CartProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
