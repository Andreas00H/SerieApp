import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { api, ApiError } from "../../../api/client";
import type { Title, TitleInput, TitleStatus } from "../../../api/types";
import { useAuth } from "../../../auth/AuthContext";
import Button from "../../../components/Button";
import Poster from "../../../components/Poster";
import SegmentedControl from "../../../components/SegmentedControl";
import StateView from "../../../components/StateView";
import TitleForm from "../../../components/TitleForm";
import { colors, kindLabels, radius, statusColors, statusLabels } from "../../../constants/theme";

const STATUS_OPTIONS = (["unwatched", "watching", "watched"] as TitleStatus[]).map((value) => ({
  value,
  label: statusLabels[value],
  color: statusColors[value]
}));

export default function TitleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState<Title | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const titleId = Number(id);

  const load = useCallback(async () => {
    if (!token || !Number.isInteger(titleId) || titleId <= 0) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await api.getTitle(token, titleId);
      setTitle(data.title);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setError(err instanceof ApiError ? err.message : "Could not load the title");
      }
    } finally {
      setLoading(false);
    }
  }, [token, titleId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function flash(text: string) {
    setNotice(text);
    setTimeout(() => setNotice(null), 2000);
  }

  async function changeStatus(status: TitleStatus) {
    if (!token || !title || status === title.status) return;
    setSaving(true);
    setError(null);
    try {
      const data = await api.updateTitle(token, title.id, {
        name: title.name,
        kind: title.kind,
        status,
        genre: title.genre ?? undefined,
        runtimeMinutes: title.runtimeMinutes ?? undefined,
        externalId: title.externalId ?? undefined,
        imageUrl: title.imageUrl ?? undefined
      });
      setTitle(data.title);
      flash(`Status changed to ${statusLabels[status].toLowerCase()}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update status");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(input: TitleInput) {
    if (!token || !title) return;
    setSaving(true);
    setSaveError(null);
    try {
      const data = await api.updateTitle(token, title.id, input);
      setTitle(data.title);
      setEditing(false);
      flash("Changes saved");
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (Platform.OS === "web") {
      const ok = (globalThis as { confirm?: (msg: string) => boolean }).confirm?.(
        `Delete "${title?.name}"?`
      );
      if (ok) deleteTitle();
      return;
    }
    Alert.alert("Delete title", `Delete "${title?.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: deleteTitle }
    ]);
  }

  async function deleteTitle() {
    if (!token || !title) return;
    setDeleting(true);
    try {
      await api.deleteTitle(token, title.id);
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete the title");
      setDeleting(false);
    }
  }

  if (loading) {
    return <StateView kind="loading" />;
  }
  if (notFound || (!title && !error)) {
    return <StateView kind="empty" title="Title not found" message="It may have been deleted." />;
  }
  if (!title) {
    return <StateView kind="error" message={error ?? undefined} onRetry={() => load()} />;
  }

  if (editing) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.editHeading}>Edit</Text>
          <TitleForm
            initial={title}
            submitting={saving}
            error={saveError}
            submitLabel="Save changes"
            onSubmit={saveEdit}
          />
          <Button label="Cancel" variant="ghost" onPress={() => setEditing(false)} disabled={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const facts = [
    { label: "Type", value: kindLabels[title.kind] },
    { label: "Genre", value: title.genre ?? "None" },
    { label: "Runtime", value: title.runtimeMinutes ? `${title.runtimeMinutes} min` : "Unknown" }
  ];

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Poster name={title.name} imageUrl={title.imageUrl} width={150} style={styles.heroPoster} />
          <Text style={styles.name}>{title.name}</Text>
          <Text style={styles.added}>
            Added {new Date(title.createdAt).toLocaleDateString("en-GB")}
          </Text>
        </View>

        <View style={styles.facts}>
          {facts.map((fact, i) => (
            <View key={fact.label} style={[styles.fact, i > 0 && styles.factDivider]}>
              <Text style={styles.factLabel}>{fact.label}</Text>
              <Text style={styles.factValue} numberOfLines={1}>
                {fact.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Status</Text>
          <SegmentedControl
            options={STATUS_OPTIONS}
            value={title.status}
            onChange={changeStatus}
            disabled={saving}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button label="Edit" variant="secondary" onPress={() => setEditing(true)} style={styles.action} />
          <Button
            label="Delete"
            variant="danger"
            onPress={confirmDelete}
            loading={deleting}
            style={styles.action}
          />
        </View>

        {title.externalId ? <Text style={styles.credit}>Data from TVmaze (CC BY-SA)</Text> : null}
      </ScrollView>

      {notice ? (
        <View style={styles.toast} accessibilityLiveRegion="polite">
          <Text style={styles.toastText}>✓  {notice}</Text>
        </View>
      ) : null}
    </View>
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
    gap: 22
  },
  hero: {
    alignItems: "center",
    gap: 8
  },
  heroPoster: {
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3
  },
  added: {
    color: colors.muted,
    fontSize: 13
  },
  facts: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14
  },
  fact: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6
  },
  factDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border
  },
  factLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  factValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  section: {
    gap: 8
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3
  },
  error: {
    color: colors.danger,
    fontSize: 14
  },
  actions: {
    flexDirection: "row",
    gap: 10
  },
  action: {
    flex: 1
  },
  credit: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "center"
  },
  editHeading: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800"
  },
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 32,
    backgroundColor: colors.cardAlt,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  toastText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center"
  }
});
