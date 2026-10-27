import { useCallback, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useFocusEffect } from "expo-router";
import { api, ApiError } from "../../../api/client";
import type { Title, TitleInput, TitleStatus } from "../../../api/types";
import { useAuth } from "../../../auth/AuthContext";
import Button from "../../../components/Button";
import StateView from "../../../components/StateView";
import StatusPill from "../../../components/StatusPill";
import TitleForm from "../../../components/TitleForm";
import { colors, kindLabels, statusLabels } from "../../../constants/theme";

const STATUSES: TitleStatus[] = ["unwatched", "watching", "watched"];

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
        setError(err instanceof ApiError ? err.message : "Kunde inte hämta titeln");
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

  async function changeStatus(status: TitleStatus) {
    if (!token || !title) return;
    setSaving(true);
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
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kunde inte uppdatera status");
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
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Kunde inte spara ändringarna");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    Alert.alert("Ta bort titeln", `Vill du ta bort "${title?.name}"?`, [
      { text: "Avbryt", style: "cancel" },
      { text: "Ta bort", style: "destructive", onPress: deleteTitle }
    ]);
  }

  async function deleteTitle() {
    if (!token || !title) return;
    setDeleting(true);
    try {
      await api.deleteTitle(token, title.id);
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kunde inte ta bort titeln");
      setDeleting(false);
    }
  }

  if (loading) {
    return <StateView kind="loading" />;
  }
  if (notFound) {
    return <StateView kind="empty" message="Titeln hittades inte" />;
  }
  if (error && !title) {
    return <StateView kind="error" message={error} onRetry={() => load()} />;
  }
  if (!title) {
    return <StateView kind="error" message="Titeln hittades inte" />;
  }

  if (editing) {
    return (
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TitleForm
          initial={title}
          submitting={saving}
          error={saveError}
          submitLabel="Spara ändringar"
          onSubmit={saveEdit}
        />
        <Button
          label="Avbryt"
          variant="secondary"
          onPress={() => setEditing(false)}
          disabled={saving}
          style={styles.cancelButton}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        {title.imageUrl ? (
          <Image source={{ uri: title.imageUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterEmpty]} />
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>{title.name}</Text>
          <Text style={styles.meta}>
            {kindLabels[title.kind]}
            {title.genre ? ` · ${title.genre}` : ""}
            {title.runtimeMinutes ? ` · ${title.runtimeMinutes} min` : ""}
          </Text>
          {title.externalId ? (
            <Text style={styles.tvmaze}>TVmaze-id {title.externalId}</Text>
          ) : null}
          <StatusPill status={title.status} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Status</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.statusChoice, title.status === status && styles.statusChoiceActive]}
              onPress={() => changeStatus(status)}
              disabled={saving}
            >
              <Text
                style={[styles.statusChoiceText, title.status === status && styles.statusChoiceTextActive]}
              >
                {statusLabels[status]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button label="Redigera" variant="secondary" onPress={() => setEditing(true)} style={styles.action} />
        <Button label="Ta bort" variant="danger" onPress={confirmDelete} loading={deleting} style={styles.action} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 18
  },
  headerRow: {
    flexDirection: "row",
    gap: 14
  },
  poster: {
    width: 110,
    height: 156,
    borderRadius: 10,
    backgroundColor: colors.border
  },
  posterEmpty: {
    backgroundColor: colors.border
  },
  headerText: {
    flex: 1,
    gap: 6
  },
  name: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800"
  },
  meta: {
    color: colors.muted,
    fontSize: 15
  },
  tvmaze: {
    color: colors.muted,
    fontSize: 12
  },
  section: {
    gap: 8
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  statusRow: {
    flexDirection: "row",
    gap: 8
  },
  statusChoice: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center"
  },
  statusChoiceActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDark
  },
  statusChoiceText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  },
  statusChoiceTextActive: {
    fontWeight: "800"
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
  cancelButton: {
    marginTop: 12
  }
});
