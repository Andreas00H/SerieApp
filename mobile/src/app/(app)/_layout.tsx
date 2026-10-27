import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../auth/AuthContext";
import Splash from "../../components/Splash";
import { colors } from "../../constants/theme";

export default function AppLayout() {
  const { token, booting, user } = useAuth();
  if (booting) return <Splash />;
  if (!token) return <Redirect href="/login" />;
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" }
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: user ? `${user.email}'s list` : "Your list"
        }}
      />
      <Stack.Screen name="random" options={{ title: "Random" }} />
      <Stack.Screen name="titles/new" options={{ title: "New title", presentation: "modal" }} />
      <Stack.Screen name="titles/[id]" options={{ title: "Details" }} />
    </Stack>
  );
}
