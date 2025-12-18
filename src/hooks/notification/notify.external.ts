import { useNotificationStore } from "@/stores/notificationStore";
// Function para mostrar notificaciones FUERA de un componente react, por ej. services
type NotifyBase = { message: string, message2?: string };
type NotifyConfirm = NotifyBase & { onConfirm: () => void; onCancel?: () => void };
export const notify = {
  success: ({ message }: NotifyBase) =>
    useNotificationStore.getState().show({ type: "success", message }),
  error: ({ message }: NotifyBase) =>
    useNotificationStore.getState().show({ type: "error", message }),
  info: ({ message }: NotifyBase) =>
    useNotificationStore.getState().show({ type: "info", message }),
  cartItem: ({message,message2, onConfirm, onCancel}: NotifyConfirm) =>
    useNotificationStore.getState().show({
      type: "cartItem",
      message,
      message2,
      onConfirm,
      onCancel,
  }),
  confirm: ({message, onConfirm, onCancel}: NotifyConfirm) =>
    useNotificationStore.getState().show({
      type: "confirm",
      message,
      onConfirm,
      onCancel,
    }),
};
