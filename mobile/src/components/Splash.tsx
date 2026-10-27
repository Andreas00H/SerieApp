import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export default function Splash() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SerieApp</Text>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 16
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1
  }
});
