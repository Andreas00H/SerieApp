import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { api } from "../../../api/client";
import type { Title } from "../../../api/types";
import { useAuth } from "../../../auth/AuthContext";
import Button from "../../../components/Button";
import { colors } from "../../../constants/theme";

export default function ProfileScreen() {
  const { token, user, signOut } = useAuth();
  const [titles, setTitles] = useState<Title[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      api
        .listTitles(token)
        .then((data) => setTitles(data.titles))
        .catch(() => setTitles(null));
    }, [token])
  );

  const count = (status?: Title["status"]) => {
    if (!titles) return "–";
    return String(status ? titles.filter((t) => t.status === status).length : titles.length);
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <Text style={styles.label}>Signed in as</Text>
      <Text style={styles.email}>{user?.email ?? "Unknown"}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{count()}</Text>
          <Text style={styles.statLabel}>Titles</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{count("watching")}</Text>
          <Text style={styles.statLabel}>Watching</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{count("watched")}</Text>
          <Text style={styles.statLabel}>Watched</Text>
        </View>
      </View>

      <Button label="Sign out" variant="danger" onPress={signOut} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    gap: 8,
    alignItems: "center"
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8
  },
  avatarText: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800"
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  email: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700"
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    alignSelf: "stretch",
    marginTop: 24
  },
  stat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16
  },
  statNumber: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800"
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  button: {
    alignSelf: "stretch",
    marginTop: 24
  }
});