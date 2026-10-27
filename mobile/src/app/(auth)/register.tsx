import { useState } from "react";
import { Link } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/Button";
import Field from "../../components/Field";
import { colors } from "../../constants/theme";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signUp(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>SerieApp</Text>
        <Text style={styles.tagline}>Create an account for your list</Text>

        <Field
          label="Email"
          inputProps={{
            value: email,
            onChangeText: setEmail,
            autoCapitalize: "none",
            autoComplete: "email",
            keyboardType: "email-address",
            placeholder: "you@example.com"
          }}
        />
        <Field
          label="Password"
          hint="At least 8 characters"
          inputProps={{
            value: password,
            onChangeText: setPassword,
            secureTextEntry: true,
            placeholder: "Choose a password"
          }}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Create account" onPress={submit} loading={submitting} style={styles.submit} />

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.linkWrap}>
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </TouchableOpacity>
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
    gap: 14
  },
  logo: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1
  },
  tagline: {
    color: colors.muted,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16
  },
  error: {
    color: colors.danger,
    fontSize: 14
  },
  submit: {
    marginTop: 8
  },
  linkWrap: {
    alignItems: "center",
    padding: 8
  },
  link: {
    color: colors.blue,
    fontSize: 15
  }
});
