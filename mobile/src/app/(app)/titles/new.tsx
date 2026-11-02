import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { api, ApiError } from "../../../api/client";
import type { TitleInput } from "../../../api/types";
import { useAuth } from "../../../auth/AuthContext";
import StateView from "../../../components/StateView";
import TitleForm from "../../../components/TitleForm";
import { colors } from "../../../constants/theme";

export default function NewTitleScreen() {
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: TitleInput) {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.createTitle(token, input);
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the title");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return <StateView kind="error" message="You must be signed in" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TitleForm submitting={submitting} error={error} submitLabel="Save title" onSubmit={submit} />
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
    paddingBottom: 60
  }
});
