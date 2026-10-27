import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../auth/AuthContext";
import Splash from "../../components/Splash";
import { colors } from "../../constants/theme";

export default function AuthLayout() {
  const { token, booting } = useAuth();
  if (booting) return <Splash />;
  if (token) return <Redirect href="/" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg }
      }}
    />
  );
}
