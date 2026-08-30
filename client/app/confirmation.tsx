import { formatPrice } from "@/src/lib/money";
import { resetToMenu } from "@/src/navigation/reset-root";
import { colors } from "@/src/theme";
import { useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ConfirmationScreen() {
  const { confirmationNumber, total } = useLocalSearchParams<{
    confirmationNumber?: string;
    total?: string;
  }>();

  const parsedTotal = total ? Number(total) : NaN;

  return (
    <View style={styles.screen}>
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>Order placed</Text>
        <Text style={styles.title}>Thank you</Text>
        <Text style={styles.body}>
          Save this confirmation number. You will need it if you look up the
          order later.
        </Text>
        <View style={styles.card}>
          <Text style={styles.label}>Confirmation</Text>
          <Text selectable style={styles.confirmation}>
            {confirmationNumber ?? "—"}
          </Text>
          {Number.isFinite(parsedTotal) ? (
            <>
              <Text style={styles.label}>Charged</Text>
              <Text style={styles.total}>{formatPrice(parsedTotal)}</Text>
            </>
          ) : null}
        </View>
        <Pressable style={styles.button} onPress={resetToMenu}>
          <Text style={styles.buttonLabel}>Back to menu</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    width: "100%",
    maxWidth: 400,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: colors.muted,
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: 4,
  },
  confirmation: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 16,
  },
  total: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  buttonLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});
