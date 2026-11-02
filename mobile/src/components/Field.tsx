import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { colors, radius } from "../constants/theme";

type Props = {
  label: string;
  inputProps?: TextInputProps;
  hint?: string;
  invalid?: boolean;
};

export default function Field({ label, inputProps, hint, invalid }: Props) {
  const [focused, setFocused] = useState(false);
  const borderColor = invalid ? colors.danger : focused ? colors.accent : colors.border;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.accent}
        accessibilityLabel={label}
        {...inputProps}
        style={[styles.input, { borderColor }, inputProps?.style]}
        onFocus={(e) => {
          setFocused(true);
          inputProps?.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps?.onBlur?.(e);
        }}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 50
  },
  hint: {
    color: colors.muted,
    fontSize: 12
  }
});
