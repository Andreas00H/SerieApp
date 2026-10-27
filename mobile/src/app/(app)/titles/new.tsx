import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView, Platform } from "react-native";
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
      setError(err instanceof ApiError ? err.message : "Kunde inte spara titeln");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return <StateView kind="error" message="Du måste vara inloggad" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TitleForm
          submitting={submitting}
          error={error}
          submitLabel="Spara titel"
          onSubmit={submit}
        />
        <View style={{ height: 40 }} />
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
    padding: 16
  }
});
