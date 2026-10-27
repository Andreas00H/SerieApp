import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";
import Button from "./Button";

type Props = {
  kind: "loading" | "empty" | "error";
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
  onAction?: () => void;
};

export default function StateView({ kind, message, onRetry, actionLabel, onAction }: Props) {
  if (kind === "loading") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message ?? (kind === "empty" ? "Nothing here yet" : "Something went wrong")}</Text>
      {kind === "empty" && actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
      {kind === "error" && onRetry ? (
        <Button label="Try again" onPress={onRetry} variant="secondary" style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24
  },
  message: {
    color: colors.muted,
    fontSize: 16,
    textAlign: "center"
  },
  button: {
    alignSelf: "stretch",
    marginTop: 8
  }
});
