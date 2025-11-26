import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { BeCoinsState, useBeCoinsStore } from "./useBecoinStore";
const STORAGE_KEY = "becoins-store";
let hasLoaded = false;
async function loadState(): Promise<Partial<BeCoinsState> | null> {
  try {
    if (Platform.OS === "web") {
      const data = window.localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } else {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    }
  } catch {
    return null;
  }
}
// Hook para hidratar el store al iniciar y evitar sobrescribir el estado persistido
export function useBeCoinsStoreHydration() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (hasLoaded) return;
    hasLoaded = true;
    (async () => {
      const loaded = await loadState();
      if (loaded && loaded.transactions) {
        loaded.transactions = loaded.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }));
        useBeCoinsStore.setState((prev) => ({ ...prev, ...loaded }));
      }
      setIsLoaded(true);
    })();
  }, []);
  return isLoaded;
}
