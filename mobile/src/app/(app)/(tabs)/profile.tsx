import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../auth/AuthContext";
import Button from "../../../components/Button";
import { colors } from "../../../constants/theme";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Signed in as</Text>
      <Text style={styles.email}>{user?.email ?? "Unknown"}</Text>
      <Button label="Sign out" variant="danger" onPress={signOut} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    gap: 8
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  email: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700"
  },
  button: {
    marginTop: 24
  }
});