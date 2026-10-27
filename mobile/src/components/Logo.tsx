import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../constants/theme";

type Props = {
  size?: "md" | "lg";
};

// Enkel logga: en ikon med en playknapp och ordet SerieApp
export default function Logo({ size = "lg" }: Props) {
  const big = size === "lg";
  const mark = big ? 64 : 44;
  return (
    <View style={styles.wrapper}>
      <View style={[styles.mark, { width: mark, height: mark, borderRadius: big ? radius.xl : radius.lg }]}>
        <View
          style={[
            styles.play,
            {
              borderLeftWidth: big ? 22 : 15,
              borderTopWidth: big ? 13 : 9,
              borderBottomWidth: big ? 13 : 9
            }
          ]}
        />
      </View>
      <Text style={[styles.word, { fontSize: big ? 34 : 26 }]}>
        Serie<Text style={styles.wordAccent}>App</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 14
  },
  mark: {
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-6deg" }]
  },
  play: {
    width: 0,
    height: 0,
    marginLeft: 5,
    borderLeftColor: colors.onAccent,
    borderTopColor: "transparent",
    borderBottomColor: "transparent"
  },
  word: {
    color: colors.text,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  wordAccent: {
    color: colors.accent
  }
});
