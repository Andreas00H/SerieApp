import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../constants/theme";
import Button from "./Button";

type Props = {
  kind: "loading" | "empty" | "error";
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
  onAction?: () => void;
};

export default function StateView({ kind, title, message, onRetry, actionLabel, onAction }: Props) {
  if (kind === "loading") {
    return (
      <View style={styles.container} accessibilityLabel="Loading">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const isEmpty = kind === "empty";
  return (
    <View style={styles.container}>
      <View style={[styles.badge, !isEmpty && styles.badgeError]}>
        <Text style={styles.icon}>{isEmpty ? "🍿" : "⚠️"}</Text>
      </View>
      <Text style={styles.title}>{title ?? (isEmpty ? "Nothing here yet" : "Something went wrong")}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {isEmpty && actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
      {!isEmpty && onRetry ? (
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
    gap: 10,
    padding: 32
  },
  badge: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6
  },
  badgeError: {
    backgroundColor: "rgba(255, 93, 93, 0.14)"
  },
  icon: {
    fontSize: 34
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center"
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 300
  },
  button: {
    alignSelf: "stretch",
    marginTop: 12
  }
});
