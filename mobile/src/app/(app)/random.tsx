import { useState } from "react";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import Poster from "../../components/Poster";
import StatusPill from "../../components/StatusPill";
import { colors, kindLabels, radius } from "../../constants/theme";

const TIME_PRESETS = [
  { label: "No limit", value: "" },
  { label: "30 min", value: "30" },
  { label: "1 h", value: "60" },
  { label: "2 h", value: "120" }
];

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

  const meta = result
    ? [kindLabels[result.kind], result.genre, result.runtimeMinutes ? `${result.runtimeMinutes} min` : null]
        .filter(Boolean)
        .join("  ·  ")
    : "";

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.question}>What are we watching tonight?</Text>
          <Text style={styles.sub}>Add filters if you like, or just pick one.</Text>
        </View>

        <View style={styles.card}>
          <Field
            label="Genre"
            inputProps={{
              value: genre,
              onChangeText: setGenre,
              placeholder: "Optional, e.g. Drama",
              autoCapitalize: "none"
            }}
          />
          <View style={styles.group}>
            <Text style={styles.groupLabel}>How much time do you have?</Text>
            <View style={styles.presets}>
              {TIME_PRESETS.map((p) => {
                const active = maxRuntime === p.value;
                return (
                  <Pressable
                    key={p.label}
                    onPress={() => setMaxRuntime(p.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.preset, active && styles.presetActive]}
                  >
                    <Text style={[styles.presetText, active && styles.presetTextActive]}>{p.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Field
              label="Or enter max minutes"
              inputProps={{
                value: maxRuntime,
                onChangeText: setMaxRuntime,
                placeholder: "e.g. 90",
                keyboardType: "number-pad"
              }}
            />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label={result ? "Randomize again" : "Pick a random title"} onPress={roll} loading={loading} />

        {miss ? (
          <View style={styles.miss}>
            <Text style={styles.missTitle}>Nothing matched</Text>
            <Text style={styles.missText}>Try removing a filter or add more titles.</Text>
          </View>
        ) : null}

        {result ? (
          <View style={styles.result}>
            <Text style={styles.resultLabel}>TONIGHT'S PICK</Text>
            <Poster name={result.name} imageUrl={result.imageUrl} width={130} />
            <Text style={styles.resultName}>{result.name}</Text>
            {meta ? <Text style={styles.resultMeta}>{meta}</Text> : null}
            <StatusPill status={result.status} style={{ alignSelf: "center" }} />
            <Button
              label="Open title"
              variant="secondary"
              onPress={() => router.push(`/titles/${result.id}`)}
              style={styles.openButton}
            />
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
    padding: 20,
    paddingBottom: 48,
    gap: 16
  },
  intro: {
    gap: 4,
    marginBottom: 4
  },
  question: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3
  },
  sub: {
    color: colors.muted,
    fontSize: 15
  },
  card: {
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16
  },
  group: {
    gap: 10
  },
  groupLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3
  },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  preset: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt
  },
  presetActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft
  },
  presetText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700"
  },
  presetTextActive: {
    color: colors.accent
  },
  error: {
    color: colors.danger,
    fontSize: 14
  },
  miss: {
    alignItems: "center",
    gap: 4,
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border
  },
  missTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800"
  },
  missText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center"
  },
  result: {
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderColor: colors.accent,
    borderWidth: 1.5,
    borderRadius: radius.xl,
    padding: 22
  },
  resultLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4
  },
  resultName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 6
  },
  resultMeta: {
    color: colors.muted,
    fontSize: 14
  },
  openButton: {
    alignSelf: "stretch",
    marginTop: 8
  }
});
