import { StyleSheet, Text, View } from "react-native";
import { statusColors, statusLabels } from "../constants/theme";

type Props = {
  status: string;
};

export default function StatusPill({ status }: Props) {
  const color = statusColors[status] ?? "#999";
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{statusLabels[status] ?? status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: "flex-start"
  },
  text: {
    fontSize: 12,
    fontWeight: "700"
  }
});
