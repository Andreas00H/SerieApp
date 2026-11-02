import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../constants/theme";

type Option<T extends string> = {
  value: T;
  label: string;
  color?: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

// Rad med val där ett alternativ är aktivt, används för typ och status
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled
}: Props<T>) {
  return (
    <View style={styles.track} accessibilityRole="radiogroup">
      {options.map((option) => {
        const active = option.value === value;
        const activeColor = option.color ?? colors.accent;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: active, disabled }}
            style={({ pressed }) => [
              styles.segment,
              active && { backgroundColor: colors.cardAlt, borderColor: activeColor },
              pressed && !active && styles.pressed
            ]}
          >
            {option.color ? (
              <View style={[styles.dot, { backgroundColor: active ? activeColor : colors.border }]} />
            ) : null}
            <Text style={[styles.text, active && { color: colors.text, fontWeight: "800" }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4
  },
  segment: {
    flex: 1,
    height: 42,
    flexDirection: "row",
    gap: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    backgroundColor: colors.cardAlt
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  text: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600"
  }
});
