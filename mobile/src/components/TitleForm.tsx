import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Title, TitleInput, TitleKind, TitleStatus, TvmazeResult } from "../api/types";
import { colors, kindLabels, radius, statusColors, statusLabels } from "../constants/theme";
import Button from "./Button";
import Field from "./Field";
import Poster from "./Poster";
import SegmentedControl from "./SegmentedControl";
import TvmazeSearch from "./TvmazeSearch";

type Props = {
  initial?: Title | null;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (input: TitleInput) => void;
};

const KIND_OPTIONS = (["movie", "series"] as TitleKind[]).map((value) => ({
  value,
  label: kindLabels[value]
}));

const STATUS_OPTIONS = (["unwatched", "watching", "watched"] as TitleStatus[]).map((value) => ({
  value,
  label: statusLabels[value],
  color: statusColors[value]
}));

export default function TitleForm({ initial, submitting, error, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<TitleKind>("movie");
  const [status, setStatus] = useState<TitleStatus>("unwatched");
  const [genre, setGenre] = useState("");
  const [runtime, setRuntime] = useState("");
  const [picked, setPicked] = useState<TvmazeResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState<"name" | "runtime" | null>(null);

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
    setInvalidField(null);
  }

  function submit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError("Name is required");
      setInvalidField("name");
      return;
    }
    const runtimeValue = runtime.trim() ? Number(runtime.trim()) : undefined;
    if (runtimeValue !== undefined && (!Number.isFinite(runtimeValue) || runtimeValue <= 0)) {
      setLocalError("Runtime must be a positive number (minutes)");
      setInvalidField("runtime");
      return;
    }
    setLocalError(null);
    setInvalidField(null);
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

  const message = localError ?? error;

  return (
    <View style={styles.wrapper}>
      {!initial ? <TvmazeSearch onPick={pickFromTvmaze} /> : null}

      {picked ? (
        <View style={styles.picked}>
          <Poster name={picked.name} imageUrl={picked.imageUrl} width={40} />
          <View style={styles.pickedText}>
            <Text style={styles.pickedTitle}>Filled in from TVmaze</Text>
            <Text style={styles.pickedSub}>The fields below are filled in, edit if you like</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.card}>
        <Field
          label="Name"
          invalid={invalidField === "name"}
          inputProps={{
            value: name,
            onChangeText: (text) => {
              setName(text);
              if (invalidField === "name") setInvalidField(null);
            },
            placeholder: "e.g. Interstellar",
            returnKeyType: "next"
          }}
        />

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Type</Text>
          <SegmentedControl options={KIND_OPTIONS} value={kind} onChange={setKind} />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Status</Text>
          <SegmentedControl options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        </View>

        <View style={styles.row}>
          <View style={styles.flex}>
            <Field
              label="Genre"
              inputProps={{ value: genre, onChangeText: setGenre, placeholder: "e.g. Drama" }}
            />
          </View>
          <View style={styles.runtime}>
            <Field
              label="Minutes"
              invalid={invalidField === "runtime"}
              inputProps={{
                value: runtime,
                onChangeText: (text) => {
                  setRuntime(text);
                  if (invalidField === "runtime") setInvalidField(null);
                },
                placeholder: "45",
                keyboardType: "number-pad"
              }}
            />
          </View>
        </View>
        <Text style={styles.hint}>Runtime is used when you randomize with a time filter.</Text>
      </View>

      {message ? (
        <View style={styles.errorBox} accessibilityLiveRegion="polite">
          <Text style={styles.errorText}>{message}</Text>
        </View>
      ) : null}

      <Button label={submitLabel} onPress={submit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16
  },
  card: {
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16
  },
  picked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: 10
  },
  pickedText: {
    flex: 1,
    gap: 2
  },
  pickedTitle: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700"
  },
  pickedSub: {
    color: colors.muted,
    fontSize: 13
  },
  group: {
    gap: 6
  },
  groupLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3
  },
  row: {
    flexDirection: "row",
    gap: 12
  },
  flex: {
    flex: 1
  },
  runtime: {
    width: 100
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: -8
  },
  errorBox: {
    backgroundColor: "rgba(255, 93, 93, 0.12)",
    borderRadius: radius.md,
    padding: 12
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600"
  }
});
