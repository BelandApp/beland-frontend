// utils/storageEngine.ts
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface StorageEngine {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  getAllKeys: () => Promise<readonly string[]>;
}

const webStorage = {
  getItem: async (key: string) => localStorage.getItem(key),
  setItem: async (key: string, value: string) =>
    localStorage.setItem(key, value),
  removeItem: async (key: string) => localStorage.removeItem(key),
  getAllKeys: async () => Object.keys(localStorage),
};

const nativeStorage = {
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
  getAllKeys: AsyncStorage.getAllKeys,
};

// 👇 Selección automática según plataforma
export const storage: StorageEngine =
  Platform.OS === "web" ? webStorage : nativeStorage;
