import { useNotificationStore } from "@/stores/notificationStore";
// Function para mostrar notificaciones FUERA de un componente react, por ej. services
export const notify = {
  success: (message: string) =>
    useNotificationStore.getState().show({ type: "success", message }),
  error: (message: string) =>
    useNotificationStore.getState().show({ type: "error", message }),
  info: (message: string) =>
    useNotificationStore.getState().show({ type: "info", message }),
  confirm: (message: string, onConfirm: () => void, onCancel?: () => void) =>
    useNotificationStore.getState().show({
      type: "confirm",
      message,
      onConfirm,
      onCancel,
    }),
};
