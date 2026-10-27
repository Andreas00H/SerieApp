import { useCallback, useState } from "react";
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Link, router, useFocusEffect } from "expo-router";
import { api, ApiError } from "../../api/client";
import type { Title } from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/Button";
import StateView from "../../components/StateView";
import StatusPill from "../../components/StatusPill";
import { colors, kindLabels } from "../../constants/theme";

export default function ListScreen() {
  const { token } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (soft = false) => {
      if (!token) return;
      if (soft) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const data = await api.listTitles(token);
        setTitles(data.titles);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Kunde inte hämta listan");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return <StateView kind="loading" />;
  }
  if (error && titles.length === 0) {
    return <StateView kind="error" message={error} onRetry={() => load()} />;
  }
  if (titles.length === 0) {
    return (
      <StateView
        kind="empty"
        message="Inga titlar än – lägg till din första film eller serie"
        actionLabel="Lägg till titel"
        onAction={() => router.push("/titles/new")}
      />
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.actions}>
        <Button
          label="Lägg till titel"
          onPress={() => router.push("/titles/new")}
          style={styles.actionButton}
        />
        <Button
          label="Slumpa"
          variant="secondary"
          onPress={() => router.push("/random")}
          style={styles.actionButton}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.accent}
          />
        }
      >
        {titles.map((title) => (
          <TitleRow key={title.id} title={title} />
        ))}
        {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
}

function TitleRow({ title }: { title: Title }) {
  return (
    <Link href={`/titles/${title.id}`} asChild>
      <TouchableOpacity style={styles.row}>
        {title.imageUrl ? (
          <Image source={{ uri: title.imageUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterEmpty]}>
            <Text style={styles.posterEmoji}>{title.kind === "movie" ? "✦" : "▶"}</Text>
          </View>
        )}
        <View style={styles.rowText}>
          <Text style={styles.name} numberOfLines={1}>
            {title.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {kindLabels[title.kind]}
            {title.genre ? ` · ${title.genre}` : ""}
            {title.runtimeMinutes ? ` · ${title.runtimeMinutes} min` : ""}
          </Text>
        </View>
        <StatusPill status={title.status} />
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    paddingBottom: 8
  },
  actionButton: {
    flex: 1
  },
  list: {
    padding: 16,
    gap: 10
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12
  },
  poster: {
    width: 46,
    height: 64,
    borderRadius: 6,
    backgroundColor: colors.border
  },
  posterEmpty: {
    alignItems: "center",
    justifyContent: "center"
  },
  posterEmoji: {
    color: colors.muted,
    fontSize: 18
  },
  rowText: {
    flex: 1,
    gap: 3
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  meta: {
    color: colors.muted,
    fontSize: 13
  },
  inlineError: {
    color: colors.amber,
    textAlign: "center",
    paddingVertical: 8
  }
});
