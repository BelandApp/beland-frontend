import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { BECOIN_CONFIG } from "src/constants";
const { persist, createJSONStorage } = require("zustand/middleware");

// --- Types ---
export interface BeCoinsTransaction {
  id: string;
  type: "earned" | "spent" | "refund";
  amount: number;
  description: string;
  category: "reward" | "catalog" | "group_payment" | "initial" | "bonus";
  timestamp: string; // store as string, convert to Date only when needed
  relatedId?: string;
}

export interface BeCoinsState {
  balance: number;
  locked_balance: number;
  totalEarned: number;
  totalSpent: number;
  lastSyncedAt: number | null;
}

interface BeCoinsActions {
  setBalance: (amount: number) => void;
  setLockedBalance: (amount: number) => void;
  syncFromBackend: (data: any) => void;
  //Utilidades
  getBeCoinsInUSD: (amount?: number) => number;
  getUSDInBeCoins: (usdAmount: number) => number;
  resetBalance: () => void;
  redeemReward: (
    rewardCost: number,
    rewardName: string,
    rewardId: string
  ) => boolean;
}

type BeCoinsStore = BeCoinsState & BeCoinsActions;

// --- Helpers ---
const generateTransactionId = () =>
  `becoin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const initialState: BeCoinsState = {
  balance: 0,
  locked_balance: 0,
  totalEarned: 0,
  totalSpent: 0,
  lastSyncedAt: null,
};

export const useBeCoinsStore = create<BeCoinsStore>()(
  persist(
    (set: any, get: any) => ({
      ...initialState,

      // =========================
      // Sync con backend
      // =========================
      syncFromBackend: (data: any) => {
        set({
          ...get(),
          ...data,
          lastSyncedAt: Date.now(),
        });
      },
      // =========================
      // Setters
      // =========================
      setBalance: (amount: number) => set({ balance: Math.max(0, amount) }),
      setLockedBalance: (amount: number) =>
        set({ locked_balance: Math.max(0, amount) }),
      // =========================
      // Utils
      // =========================
      getBeCoinsInUSD: (amount: number) =>
        (amount ?? get().balance) * BECOIN_CONFIG.VALUE_USD,
      getUSDInBeCoins: (usdAmount: number) =>
        Math.ceil(usdAmount / BECOIN_CONFIG.VALUE_USD),
      resetBalance: () => set(initialState),
      // =========================
      // Especificas
      // =========================
      redeemReward: (
        beCoinsCost: number,
        rewardName: string,
        rewardId: string
      ) => {
        return get().spendBeCoins(
          beCoinsCost,
          `Canje de premio: ${rewardName}`,
          "reward",
          rewardId
        );
      },
    }),

    {
      name: "becoins-storage",
      storage: createJSONStorage(() =>
        Platform.OS === "web" ? localStorage : AsyncStorage
      ),
    }
  )
);
