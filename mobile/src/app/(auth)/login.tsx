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

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!email.includes("@")) {
      setError("Ange en giltig e-postadress");
      return;
    }
    if (password.length < 8) {
      setError("Lösenordet måste vara minst 8 tecken");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inloggningen misslyckades");
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
        <Text style={styles.tagline}>Dina filmer och serier – på ett ställe</Text>

        <Field
          label="E-post"
          inputProps={{
            value: email,
            onChangeText: setEmail,
            autoCapitalize: "none",
            autoComplete: "email",
            keyboardType: "email-address",
            placeholder: "du@exempel.se"
          }}
        />
        <Field
          label="Lösenord"
          inputProps={{
            value: password,
            onChangeText: setPassword,
            secureTextEntry: true,
            placeholder: "Minst 8 tecken"
          }}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Logga in" onPress={submit} loading={submitting} style={styles.submit} />

        <Link href="/register" asChild>
          <TouchableOpacity style={styles.linkWrap}>
            <Text style={styles.link}>Inget konto? Skapa ett här</Text>
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
