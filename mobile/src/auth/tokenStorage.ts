import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// SecureStore finns bara på mobil. På webben används localStorage så att appen går att testa i webbläsaren.
const web = Platform.OS === "web";

function local(): Storage | null {
  try {
    return (globalThis as { localStorage?: Storage }).localStorage ?? null;
  } catch {
    return null;
  }
}

export const tokenStorage = {
  get: async (key: string) => (web ? local()?.getItem(key) ?? null : SecureStore.getItemAsync(key)),
  set: async (key: string, value: string) => {
    if (web) local()?.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  },
  remove: async (key: string) => {
    if (web) local()?.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  }
};
