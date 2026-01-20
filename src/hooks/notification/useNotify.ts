import { useNotificationStore } from "@/stores/notificationStore";

type NotifyBase = { message: string };
type NotifyConfirm = {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
};
type NotifyGroupCreated = {
  message: string;
  message2?: string;
  onShare: () => void;
  onDismiss?: () => void;
  meta?: Record<string, any>;
};

// Hook para mostrar notificaciones dentro de un componente react
export const useNotify = () => {
  const { show, clear } = useNotificationStore();

  return {
    success: (data: NotifyBase) => show({ type: "success", ...data }),
    error: (data: NotifyBase) => show({ type: "error", ...data }),
    info: (data: NotifyBase) => show({ type: "info", ...data }),
    confirm: (data: NotifyConfirm) => show({ type: "confirm", ...data }),
    cartItem: (data: NotifyConfirm) => show({ type: "cartItem", ...data }),
    groupCreated: (data: NotifyGroupCreated) =>
      show({ type: "groupCreated", ...data }),
    clear,
  };
};
