import { useState } from "react";
import { Link as RouterLink } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { api, ApiError } from "../../api/client";
import type { Title } from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/Button";
import Field from "../../components/Field";
import StateView from "../../components/StateView";
import StatusPill from "../../components/StatusPill";
import { colors, kindLabels } from "../../constants/theme";

export default function RandomScreen() {
  const { token } = useAuth();
  const [genre, setGenre] = useState("");
  const [maxRuntime, setMaxRuntime] = useState("");
  const [result, setResult] = useState<Title | null>(null);
  const [miss, setMiss] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function roll() {
    if (!token) return;
    const runtimeValue = maxRuntime.trim() ? Number(maxRuntime.trim()) : undefined;
    if (runtimeValue !== undefined && (!Number.isFinite(runtimeValue) || runtimeValue <= 0)) {
      setError("Time must be a positive number of minutes");
      return;
    }
    setLoading(true);
    setError(null);
    setMiss(false);
    try {
      const data = await api.randomTitle(token, {
        genre: genre.trim() ? genre.trim() : undefined,
        maxRuntime: runtimeValue
      });
      setResult(data.title);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setResult(null);
        setMiss(true);
      } else {
        setError(err instanceof ApiError ? err.message : "Randomize failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.question}>What are we watching tonight?</Text>

        <Field
          label="Genre (optional)"
          inputProps={{
            value: genre,
            onChangeText: setGenre,
            placeholder: "e.g. Drama",
            autoCapitalize: "none"
          }}
        />
        <Field
          label="Max time in minutes (optional)"
          inputProps={{
            value: maxRuntime,
            onChangeText: setMaxRuntime,
            placeholder: "e.g. 120",
            keyboardType: "number-pad"
          }}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={result ? "Randomize again" : "Pick a random title"}
          onPress={roll}
          loading={loading}
          style={styles.rollButton}
        />

        {miss ? (
          <StateView
            kind="empty"
            message="No titles match these filters – add more or drop them"
          />
        ) : null}

        {result ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>TONIGHT'S PICK</Text>
            <Text style={styles.cardName}>{result.name}</Text>
            <Text style={styles.cardMeta}>
              {kindLabels[result.kind]}
              {result.genre ? ` · ${result.genre}` : ""}
              {result.runtimeMinutes ? ` · ${result.runtimeMinutes} min` : ""}
            </Text>
            <StatusPill status={result.status} />
            <RouterLink href={`/titles/${result.id}`} asChild>
              <Button label="Open title" variant="secondary" style={styles.openButton} />
            </RouterLink>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg
  },
  container: {
    padding: 16,
    gap: 14
  },
  question: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8
  },
  error: {
    color: colors.danger,
    fontSize: 14
  },
  rollButton: {
    marginTop: 4
  },
  card: {
    gap: 10,
    backgroundColor: colors.card,
    borderColor: colors.accent,
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: "center"
  },
  cardLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2
  },
  cardName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center"
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 14
  },
  openButton: {
    alignSelf: "stretch",
    marginTop: 8
  }
});
