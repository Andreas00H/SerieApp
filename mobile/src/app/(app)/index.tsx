import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, ApiError } from "../../api/client";
import type { Title, TitleStatus } from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import Poster from "../../components/Poster";
import StateView from "../../components/StateView";
import StatusPill from "../../components/StatusPill";
import { colors, kindLabels, radius, statusColors, statusLabels } from "../../constants/theme";

type Filter = "all" | TitleStatus;
const FILTERS: Filter[] = ["all", "unwatched", "watching", "watched"];

export default function ListScreen() {
  const { token, user, signOut } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

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
        setError(err instanceof ApiError ? err.message : "Could not load your list");
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

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: titles.length, unwatched: 0, watching: 0, watched: 0 };
    for (const t of titles) c[t.status]++;
    return c;
  }, [titles]);

  const visible = filter === "all" ? titles : titles.filter((t) => t.status === filter);

  function confirmSignOut() {
    if (Platform.OS === "web") {
      signOut();
      return;
    }
    Alert.alert("Sign out", "Do you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => signOut() }
    ]);
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerText}>
          <Text style={styles.greeting} numberOfLines={1}>
            {user ? user.email : "Welcome"}
          </Text>
          <Text style={styles.heading}>My list</Text>
        </View>
        <Pressable
          onPress={confirmSignOut}
          accessibilityRole="button"
          style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );

  let body: ReactNode;
  if (loading) {
    body = <StateView kind="loading" />;
  } else if (error && titles.length === 0) {
    body = <StateView kind="error" message={error} onRetry={() => load()} />;
  } else if (titles.length === 0) {
    body = (
      <StateView
        kind="empty"
        title="No titles yet"
        message="Add your first movie or series to get your list started."
        actionLabel="Add title"
        onAction={() => router.push("/titles/new")}
      />
    );
  } else {
    body = (
      <FlatList
        data={visible}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <RandomBanner count={counts.unwatched} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {FILTERS.map((f) => (
                <FilterChip
                  key={f}
                  label={f === "all" ? "All" : statusLabels[f]}
                  count={counts[f]}
                  color={f === "all" ? colors.accent : statusColors[f]}
                  active={filter === f}
                  onPress={() => setFilter(f)}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.filterEmpty}>
            No titles marked {filter !== "all" ? statusLabels[filter].toLowerCase() : ""}
          </Text>
        }
        ListFooterComponent={error ? <Text style={styles.inlineError}>{error}</Text> : undefined}
        renderItem={({ item }) => <TitleRow title={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.accent} />
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      {header}
      <View style={styles.flex}>{body}</View>
      {!loading && titles.length > 0 ? (
        <Pressable
          onPress={() => router.push("/titles/new")}
          accessibilityRole="button"
          accessibilityLabel="Add title"
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.95 }] }]}
        >
          <Text style={styles.fabPlus}>+</Text>
          <Text style={styles.fabLabel}>Add</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

function RandomBanner({ count }: { count: number }) {
  return (
    <Pressable
      onPress={() => router.push("/random")}
      accessibilityRole="button"
      style={({ pressed }) => [styles.banner, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.bannerIcon}>
        <Text style={styles.bannerDice}>🎲</Text>
      </View>
      <View style={styles.bannerText}>
        <Text style={styles.bannerTitle}>Not sure what to watch?</Text>
        <Text style={styles.bannerSub}>
          {count > 0 ? `Pick from ${count} unwatched titles` : "Pick a random title from your list"}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function FilterChip({
  label,
  count,
  color,
  active,
  onPress
}: {
  label: string;
  count: number;
  color: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && { backgroundColor: `${color}22`, borderColor: color }]}
    >
      <Text style={[styles.chipText, active && { color: colors.text }]}>{label}</Text>
      <Text style={[styles.chipCount, active && { color }]}>{count}</Text>
    </Pressable>
  );
}

function TitleRow({ title }: { title: Title }) {
  const meta = [kindLabels[title.kind], title.genre, title.runtimeMinutes ? `${title.runtimeMinutes} min` : null]
    .filter(Boolean)
    .join("  ·  ");
  return (
    <Pressable
      onPress={() => router.push(`/titles/${title.id}`)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Poster name={title.name} imageUrl={title.imageUrl} width={54} />
      <View style={styles.rowText}>
        <Text style={styles.name} numberOfLines={2}>
          {title.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
        <StatusPill status={title.status} />
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12
  },
  headerText: {
    flex: 1
  },
  greeting: {
    color: colors.muted,
    fontSize: 14
  },
  heading: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5
  },
  signOut: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4
  },
  signOutText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 10
  },
  listHeader: {
    gap: 14,
    paddingTop: 8,
    paddingBottom: 4
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
    padding: 14
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  bannerDice: {
    fontSize: 22
  },
  bannerText: {
    flex: 1
  },
  bannerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  bannerSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  chips: {
    gap: 8,
    paddingRight: 16
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card
  },
  chipText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700"
  },
  chipCount: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 10
  },
  rowPressed: {
    backgroundColor: colors.cardAlt
  },
  rowText: {
    flex: 1,
    gap: 5
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700"
  },
  meta: {
    color: colors.muted,
    fontSize: 13
  },
  chevron: {
    color: colors.muted,
    fontSize: 26,
    paddingHorizontal: 4
  },
  filterEmpty: {
    color: colors.muted,
    textAlign: "center",
    paddingVertical: 32,
    fontSize: 15
  },
  inlineError: {
    color: colors.amber,
    textAlign: "center",
    paddingVertical: 8
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  fabPlus: {
    color: colors.onAccent,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 24
  },
  fabLabel: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: "800"
  }
});
