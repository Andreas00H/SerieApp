import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { api, ApiError } from "../api/client";
import type { TvmazeResult } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../constants/theme";
import Button from "./Button";
import Field from "./Field";

type Props = {
  onPick: (result: TvmazeResult) => void;
};

export default function TvmazeSearch({ onPick }: Props) {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TvmazeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    const q = query.trim();
    if (!q || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchTvmaze(token, q);
      setResults(data.results);
      if (data.results.length === 0) {
        setError("No results – try another search");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Fetch from TVmaze</Text>
      <Text style={styles.hint}>
        Searches series only – enter movies manually.
      </Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Field
            label="Search series"
            inputProps={{
              value: query,
              onChangeText: setQuery,
              placeholder: "e.g. Breaking Bad",
              returnKeyType: "search",
              onSubmitEditing: search
            }}
          />
        </View>
        <Button label="Search" onPress={search} loading={loading} disabled={!query.trim()} style={styles.button} />
      </View>
      {loading ? <ActivityIndicator color={colors.accent} style={styles.spinner} /> : null}
      {error && !loading ? <Text style={styles.error}>{error}</Text> : null}
      {results.length > 0 ? (
        <ScrollView style={styles.results} nestedScrollEnabled>
          {results.map((result) => (
            <Pressable
              key={result.externalId}
              style={({ pressed }) => [styles.result, pressed && { opacity: 0.7 }]}
              onPress={() => onPick(result)}
            >
              {result.imageUrl ? (
                <Image source={{ uri: result.imageUrl }} style={styles.poster} />
              ) : (
                <View style={[styles.poster, styles.posterEmpty]} />
              )}
              <View style={styles.resultText}>
                <Text style={styles.resultName}>{result.name}</Text>
                <Text style={styles.resultMeta}>
                  {result.premiered ? `${result.premiered.slice(0, 4)} · ` : ""}
                  {result.genres.slice(0, 3).join(", ") || "unknown genre"}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <Text style={styles.credit}>Data from TVmaze (CC BY-SA)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  heading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  hint: {
    color: colors.muted,
    fontSize: 12
  },
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end"
  },
  field: {
    flex: 1
  },
  button: {
    height: 44,
    paddingHorizontal: 18
  },
  spinner: {
    marginTop: 8
  },
  error: {
    color: colors.amber,
    fontSize: 13,
    marginTop: 8
  },
  results: {
    marginTop: 8,
    maxHeight: 220,
    borderColor: colors.border,
    borderRadius: 8
  },
  result: {
    flexDirection: "row",
    gap: 10,
    padding: 8,
    backgroundColor: colors.cardAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 8
  },
  poster: {
    width: 42,
    height: 56,
    borderRadius: 4,
    backgroundColor: colors.border
  },
  posterEmpty: {
    backgroundColor: colors.border
  },
  resultText: {
    flex: 1,
    justifyContent: "center"
  },
  resultName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600"
  },
  resultMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  credit: {
    color: colors.muted,
    fontSize: 11
  }
});
