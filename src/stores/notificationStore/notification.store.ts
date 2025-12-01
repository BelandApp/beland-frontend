
import { create } from "zustand";
interface NotificationBase {
  message: string;
  meta?: Record<string, any> | null;
}

interface NotificationConfirm extends NotificationBase {
  onConfirm: () => void;
  onCancel?: () => void;
}

export type Notification =
  | (NotificationBase & { type: "success" | "error" | "info" })
  | (NotificationConfirm & { type: "confirm" | "cartItem" });

interface NotificationStore {
  current?: Notification;
  show: (n: Notification) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  current: undefined,
  show: (n) => set({ current: n }),
  clear: () => set({ current: undefined }),
}));
