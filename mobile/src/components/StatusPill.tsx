import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { colors, radius, statusColors, statusLabels } from "../constants/theme";

type Props = {
  status: string;
  style?: StyleProp<ViewStyle>;
};

export default function StatusPill({ status, style }: Props) {
  const color = statusColors[status] ?? colors.muted;
  return (
    <View style={[styles.pill, { backgroundColor: `${color}22` }, style]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{statusLabels[status] ?? status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start"
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  text: {
    fontSize: 12,
    fontWeight: "700"
  }
});
