import { create } from "zustand";
interface NotificationBase {
  message: string;
  message2?: string;
  meta?: Record<string, any> | null;
}

interface NotificationConfirm extends NotificationBase {
  onConfirm: () => void;
  onCancel?: () => void;
}

interface NotificationGroupCreated extends NotificationBase {
  onShare: () => void;
  onDismiss?: () => void;
}

export type Notification =
  | (NotificationBase & { type: "success" | "error" | "info" })
  | (NotificationConfirm & { type: "confirm" | "cartItem" })
  | (NotificationGroupCreated & { type: "groupCreated" });

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
