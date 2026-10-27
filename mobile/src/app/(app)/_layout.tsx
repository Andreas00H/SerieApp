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
          title: user ? `${user.email}s lista` : "Listan"
        }}
      />
      <Stack.Screen name="random" options={{ title: "Slumpa" }} />
      <Stack.Screen name="titles/new" options={{ title: "Ny titel", presentation: "modal" }} />
      <Stack.Screen name="titles/[id]" options={{ title: "Detaljer" }} />
    </Stack>
  );
}
