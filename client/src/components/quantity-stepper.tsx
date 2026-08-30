import { Pressable, StyleSheet, Text, View } from "react-native";

type QuantityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
}: QuantityStepperProps) {
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.button}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Text style={styles.buttonLabel}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        style={styles.button}
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Text style={styles.buttonLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E8EFEA",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: 20,
    color: "#1F4E3D",
    fontWeight: "600",
  },
  value: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#1F4E3D",
  },
});
