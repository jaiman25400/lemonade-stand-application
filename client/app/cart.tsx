import { useCreateOrderMutation } from "@/src/api/hooks/use-create-order";
import { useCart } from "@/src/cart/cart-context";
import { cartLineTotal } from "@/src/cart/cart";
import { QuantityStepper } from "@/src/components/quantity-stepper";
import { TextField } from "@/src/components/text-field";
import { formatPrice } from "@/src/lib/money";
import { scrollFocusedIntoView } from "@/src/lib/scroll-focused-into-view";
import {
  extractNanpDigits,
  formatNanpNational,
  hasCustomerErrors,
  toE164Na,
  validateCustomer,
  type CustomerForm,
} from "@/src/lib/validate-customer";
import {
  popOrResetToMenu,
  resetToConfirmation,
} from "@/src/navigation/reset-root";
import { colors } from "@/src/theme";
import { useHeaderHeight } from "@react-navigation/elements";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";

export default function CartScreen() {
  const {
    items,
    total,
    setQuantity,
    removeItem,
    clearCart,
    customer,
    updateCustomer,
  } = useCart();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollRef = useRef<ScrollView>(null);
  const viewportRef = useRef<View>(null);
  const focusedFieldRef = useRef<View | null>(null);
  const contentOffsetY = useRef(0);
  const nameRef = useRef<View>(null);
  const emailRef = useRef<View>(null);
  const phoneRef = useRef<View>(null);
  const [submitted, setSubmitted] = useState(false);
  const placeOrder = useCreateOrderMutation();

  const errors = validateCustomer(customer);
  const visibleErrors = submitted ? errors : {};

  function updateField<K extends keyof CustomerForm>(key: K, value: string) {
    updateCustomer({ ...customer, [key]: value });
  }

  function scrollFocusedField() {
    scrollFocusedIntoView(
      scrollRef,
      viewportRef.current,
      focusedFieldRef.current,
      contentOffsetY.current,
    );
  }

  function handleFieldFocus(field: View | null) {
    focusedFieldRef.current = field;
    requestAnimationFrame(scrollFocusedField);
  }

  useEffect(() => {
    if (isWeb) {
      return;
    }
    const show = Keyboard.addListener("keyboardDidShow", () => {
      requestAnimationFrame(() => {
        scrollFocusedIntoView(
          scrollRef,
          viewportRef.current,
          focusedFieldRef.current,
          contentOffsetY.current,
        );
      });
    });
    return () => show.remove();
  }, []);

  function handlePlaceOrder() {
    setSubmitted(true);
    if (hasCustomerErrors(errors)) {
      return;
    }

    const email = customer.email.trim();
    const phone = toE164Na(customer.phone);
    placeOrder.mutate(
      {
        customerName: customer.name.trim(),
        ...(email ? { email: email.toLowerCase() } : {}),
        ...(phone ? { phone } : {}),
        items: items.map((item) => ({
          beverageId: item.beverageId,
          sizeId: item.sizeId,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: (order) => {
          clearCart();
          resetToConfirmation({
            confirmationNumber: order.confirmationNumber,
            total: String(order.total),
          });
        },
      },
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyBody}>
          Add a drink from the menu, then come back to check out.
        </Text>
        <Pressable style={styles.emptyButton} onPress={popOrResetToMenu}>
          <Text style={styles.primaryButtonLabel}>Back to menu</Text>
        </Pressable>
      </View>
    );
  }

  const footer = (
    <View
      style={[
        styles.footer,
        isWeb ? styles.footerWeb : null,
        { paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
      </View>
      <Text style={styles.totalNote}>
        Final total is confirmed by the server when you place the order.
      </Text>
      {placeOrder.isError ? (
        <Text style={styles.submitError}>
          {placeOrder.error instanceof Error
            ? placeOrder.error.message
            : "Could not place the order"}
        </Text>
      ) : null}
      <Pressable
        style={[
          styles.primaryButton,
          placeOrder.isPending && styles.primaryButtonDisabled,
        ]}
        onPress={handlePlaceOrder}
        disabled={placeOrder.isPending}
      >
        {placeOrder.isPending ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.primaryButtonLabel}>Place order</Text>
        )}
      </Pressable>
    </View>
  );

  const checkout = (
    <View style={styles.screen}>
      <View ref={viewportRef} collapsable={false} style={styles.scroll}>
        <ScrollView
          ref={scrollRef}
          style={styles.scrollFill}
          contentContainerStyle={[
            styles.scrollContent,
            isWeb ? { paddingBottom: 24 + 180 + insets.bottom } : null,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          automaticallyAdjustKeyboardInsets={!isWeb && Platform.OS === "android"}
          onScroll={(event) => {
            contentOffsetY.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
        <Text style={styles.sectionTitle}>Items</Text>
        {items.map((item) => (
          <View
            key={`${item.beverageId}:${item.sizeId}`}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardCopy}>
                <Text style={styles.itemName}>{item.beverageName}</Text>
                <Text style={styles.itemMeta}>
                  {item.sizeName} · {formatPrice(item.unitPrice)} each
                </Text>
              </View>
              <Text style={styles.lineTotal}>
                {formatPrice(cartLineTotal(item))}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <QuantityStepper
                value={item.quantity}
                onChange={(quantity) =>
                  setQuantity(item.beverageId, item.sizeId, quantity)
                }
              />
              <Pressable
                onPress={() => removeItem(item.beverageId, item.sizeId)}
                hitSlop={8}
              >
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Your details</Text>
        <Text style={styles.sectionHint}>
          Name is required. Add a 10-digit phone number or an email so we can
          reach you.
        </Text>
        <TextField
          ref={nameRef}
          label="Name"
          value={customer.name}
          onChangeText={(value) => updateField("name", value)}
          onFocus={() => handleFieldFocus(nameRef.current)}
          error={visibleErrors.name}
          placeholder="Ada Lovelace"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
        <TextField
          ref={emailRef}
          label="Email (optional)"
          value={customer.email}
          onChangeText={(value) => updateField("email", value)}
          onFocus={() => handleFieldFocus(emailRef.current)}
          error={visibleErrors.email}
          placeholder="ada@example.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <TextField
          ref={phoneRef}
          label="Phone (optional)"
          value={formatNanpNational(customer.phone)}
          onChangeText={(value) =>
            updateField("phone", extractNanpDigits(value))
          }
          onFocus={() => handleFieldFocus(phoneRef.current)}
          error={visibleErrors.phone}
          placeholder="(416) 555-0100"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          prefix="+1"
        />
        {visibleErrors.contact ? (
          <Text style={styles.contactError}>{visibleErrors.contact}</Text>
        ) : null}
        </ScrollView>
      </View>
      {footer}
    </View>
  );

  if (isWeb) {
    return checkout;
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      {checkout}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollFill: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  cardCopy: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 14,
    color: colors.muted,
  },
  lineTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  remove: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.danger,
  },
  contactError: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexShrink: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  footerWeb: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
  },
  totalNote: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 32,
    paddingVertical: 40,
    width: "100%",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
  },
  emptyBody: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: 320,
  },
  submitError: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 10,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
});
