import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useAuth } from "../../../auth/AuthContext";
import { colors } from "../../../constants/theme";

export default function TabsLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        sceneStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: user ? `${user.email}'s list` : "Your list",
          tabBarLabel: "List",
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color as string} />
        }}
      />
      <Tabs.Screen
        name="random"
        options={{
          title: "Random",
          tabBarIcon: ({ color, size }) => <Ionicons name="shuffle" size={size} color={color as string} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color as string} />
        }}
      />
    </Tabs>
  );
}