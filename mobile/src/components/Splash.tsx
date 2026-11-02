import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "../constants/theme";
import Logo from "./Logo";

export default function Splash() {
  return (
    <View style={styles.container}>
      <Logo />
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 28
  }
});
