import { useBeCoinsStore, useCartStore } from "src/stores";
import { useAuthTokenStore } from "src/stores/useAuthTokenStore";
import { useCreateGroupStore } from "src/stores/useCreateGroupStore";
import { useOrdersStoreAPI } from "src/stores/useOrdersStoreAPI";

export const STORAGE_KEYS = [
  "access_token",
  "auth_token",
  "auth_user",
  "cart-store",
  "orders-store-api",
  "becoins-store",
  "create-group-store",
  "groups-storage",
  "payphone_token",
  "wallet_id",
  "payphone_is_qr_payment",
  "payphone_to_wallet_id",
] as const;

export const STORE_RESETTERS = [
  () => useCartStore.getState().logOutCart?.(),
  () => useBeCoinsStore.getState().resetBalance?.(),
  () => useOrdersStoreAPI.getState().clearOrders?.(),
  () => useCreateGroupStore.getState().clearGroup?.(),
];

export async function clearStorage(Storage: any) {
  try {
    await Promise.all(STORAGE_KEYS.map((key) => Storage.removeItem(key)));
  } catch (error) {
    console.warn(
      "[Logout] Error clearing secure storage, falling back to localStorage:",
      error
    );

    if (typeof window !== "undefined") {
      STORAGE_KEYS.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (_) {}
      });
    }
  }
}

export function resetStores() {
  STORE_RESETTERS.forEach((reset) => {
    try {
      reset();
    } catch (err) {
      console.warn("[Logout] Store reset error:", err);
    }
  });
}