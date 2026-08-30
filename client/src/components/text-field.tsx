import { colors } from "@/src/theme";
import { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  maxLength?: number;
  prefix?: string;
  onFocus?: () => void;
};

export const TextField = forwardRef<View, TextFieldProps>(function TextField(
  {
    label,
    value,
    onChangeText,
    error,
    placeholder,
    keyboardType = "default",
    autoCapitalize = "none",
    autoComplete,
    textContentType,
    maxLength,
    prefix,
    onFocus,
  },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View ref={ref} collapsable={false} style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.box,
          focused && styles.boxFocused,
          error ? styles.boxError : null,
        ]}
      >
        {prefix ? (
          <>
            <Text style={styles.prefix}>{prefix}</Text>
            <View style={styles.prefixDivider} />
          </>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          autoCorrect={false}
          maxLength={maxLength}
          style={styles.input}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  boxFocused: {
    borderColor: colors.primary,
  },
  boxError: {
    borderColor: colors.danger,
  },
  prefix: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    paddingRight: 10,
  },
  prefixDivider: {
    width: 1,
    alignSelf: "stretch",
    marginVertical: 10,
    backgroundColor: colors.border,
    marginRight: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
  },
  error: {
    marginTop: 6,
    fontSize: 13,
    color: colors.danger,
  },
});
