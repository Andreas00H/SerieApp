import { useState } from "react";
import { Link } from "expo-router";
import type { Href } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { colors, radius } from "../constants/theme";
import Button from "./Button";
import Field from "./Field";
import Logo from "./Logo";

type Props = {
  tagline: string;
  submitLabel: string;
  passwordHint?: string;
  fallbackError: string;
  switchText: string;
  switchHref: Href;
  onSubmit: (email: string, password: string) => Promise<void>;
};

// Gemensamt formulär för inloggning och registrering
export default function AuthForm({
  tagline,
  submitLabel,
  passwordHint,
  fallbackError,
  switchText,
  switchHref,
  onSubmit
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<"email" | "password" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!email.includes("@")) {
      setError("Enter a valid email address");
      setInvalid("email");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setInvalid("password");
      return;
    }
    setSubmitting(true);
    setError(null);
    setInvalid(null);
    try {
      await onSubmit(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Logo />
          <Text style={styles.tagline}>{tagline}</Text>
        </View>

        <View style={styles.card}>
          <Field
            label="Email"
            invalid={invalid === "email"}
            inputProps={{
              value: email,
              onChangeText: (t) => {
                setEmail(t);
                if (invalid === "email") setInvalid(null);
              },
              autoCapitalize: "none",
              autoComplete: "email",
              keyboardType: "email-address",
              placeholder: "you@example.com",
              returnKeyType: "next"
            }}
          />
          <Field
            label="Password"
            hint={passwordHint}
            invalid={invalid === "password"}
            inputProps={{
              value: password,
              onChangeText: (t) => {
                setPassword(t);
                if (invalid === "password") setInvalid(null);
              },
              secureTextEntry: true,
              placeholder: "At least 8 characters",
              returnKeyType: "go",
              onSubmitEditing: submit
            }}
          />

          {error ? (
            <View style={styles.errorBox} accessibilityLiveRegion="polite">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button label={submitLabel} onPress={submit} loading={submitting} style={styles.submit} />
        </View>

        <Link href={switchHref} asChild>
          <Pressable style={styles.switch} accessibilityRole="link">
            <Text style={styles.switchText}>{switchText}</Text>
          </Pressable>
        </Link>
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
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 28
  },
  brand: {
    alignItems: "center",
    gap: 10
  },
  tagline: {
    color: colors.muted,
    fontSize: 16,
    textAlign: "center"
  },
  card: {
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20
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
  },
  submit: {
    marginTop: 4
  },
  switch: {
    alignItems: "center",
    padding: 10
  },
  switchText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: "600"
  }
});
