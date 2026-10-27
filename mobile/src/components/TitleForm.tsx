import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Title, TitleInput, TitleKind, TitleStatus, TvmazeResult } from "../api/types";
import { colors, kindLabels, statusLabels } from "../constants/theme";
import Button from "./Button";
import Field from "./Field";
import TvmazeSearch from "./TvmazeSearch";

type Props = {
  initial?: Title | null;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (input: TitleInput) => void;
};

const KINDS: TitleKind[] = ["movie", "series"];
const STATUSES: TitleStatus[] = ["unwatched", "watching", "watched"];

export default function TitleForm({ initial, submitting, error, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<TitleKind>("movie");
  const [status, setStatus] = useState<TitleStatus>("unwatched");
  const [genre, setGenre] = useState("");
  const [runtime, setRuntime] = useState("");
  const [picked, setPicked] = useState<TvmazeResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setKind(initial.kind);
      setStatus(initial.status);
      setGenre(initial.genre ?? "");
      setRuntime(initial.runtimeMinutes ? String(initial.runtimeMinutes) : "");
    }
  }, [initial]);

  function pickFromTvmaze(result: TvmazeResult) {
    setPicked(result);
    setName(result.name);
    setKind("series");
    setGenre(result.genres[0] ?? "");
    if (result.runtimeMinutes) setRuntime(String(result.runtimeMinutes));
    setLocalError(null);
  }

  function submit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError("Name is required");
      return;
    }
    const runtimeValue = runtime.trim() ? Number(runtime.trim()) : undefined;
    if (runtimeValue !== undefined && (!Number.isFinite(runtimeValue) || runtimeValue <= 0)) {
      setLocalError("Runtime must be a positive number of minutes");
      return;
    }
    setLocalError(null);
    onSubmit({
      name: trimmedName,
      kind,
      status,
      genre: genre.trim() ? genre.trim() : undefined,
      runtimeMinutes: runtimeValue,
      externalId: picked ? picked.externalId : initial?.externalId ?? undefined,
      imageUrl: picked?.imageUrl ?? initial?.imageUrl ?? undefined
    });
  }

  return (
    <View style={styles.wrapper}>
      <TvmazeSearch onPick={pickFromTvmaze} />
      {picked ? (
        <Text style={styles.picked}>Linked to TVmaze id {picked.externalId}</Text>
      ) : null}

      <Field
        label="Namn"
        inputProps={{ value: name, onChangeText: setName, placeholder: "t.ex. Interstellar" }}
      />

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Typ</Text>
        <View style={styles.choiceRow}>
          {KINDS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.choice, kind === option && styles.choiceActive]}
              onPress={() => setKind(option)}
            >
              <Text
                style={[styles.choiceText, kind === option && styles.choiceTextActive]}
              >
                {kindLabels[option]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Status</Text>
        <View style={styles.choiceRow}>
          {STATUSES.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.choice, status === option && styles.choiceActive]}
              onPress={() => setStatus(option)}
            >
              <Text
                style={[styles.choiceText, status === option && styles.choiceTextActive]}
              >
                {statusLabels[option]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Field
        label="Genre"
        inputProps={{ value: genre, onChangeText: setGenre, placeholder: "t.ex. Drama" }}
      />
      <Field
        label="Runtime (minutes)"
        hint="Used by the randomizer when you filter on time"
        inputProps={{
          value: runtime,
          onChangeText: setRuntime,
          placeholder: "t.ex. 45",
          keyboardType: "number-pad"
        }}
      />

      {localError || error ? <Text style={styles.error}>{localError ?? error}</Text> : null}

      <Button label={submitLabel} onPress={submit} loading={submitting} style={styles.submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 14
  },
  picked: {
    color: colors.accent,
    fontSize: 13
  },
  group: {
    gap: 6
  },
  groupLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  choiceRow: {
    flexDirection: "row",
    gap: 8
  },
  choice: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center"
  },
  choiceActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDark
  },
  choiceText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600"
  },
  choiceTextActive: {
    color: colors.text,
    fontWeight: "800"
  },
  error: {
    color: colors.danger,
    fontSize: 14
  },
  submit: {
    marginTop: 4
  }
});
