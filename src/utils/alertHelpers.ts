import { Alert } from "react-native";
type CustomAlert = {
  title: string;
  message: string;
  buttonText?: string;
  onClose?: () => void;
};
// Helper para mostrar alerta de código QR compartido
export const showQRSharedAlert = (onComplete?: () => void) => {
  return {
    title: "¡TU CÓDIGO QR\nHA SIDO COMPARTIDO\nCORRECTAMENTE!",
    message:
      '"Los usuarios con los cuales\ncompartís el código ya pueden\ncompartir monedas contigo"',
    type: "success" as const,
    buttonText: "Muchas gracias",
    onClose: onComplete || (() => {}),
  };
};

// Helper para otras alertas de éxito
export const showSuccessAlert = ({
  title,
  message,
  buttonText = "Aceptar",
  onClose,
}: CustomAlert) => {
  return {
    title,
    message,
    type: "success" as const,
    buttonText,
    onClose: onClose || (() => {}),
  };
};

// Helper para alertas de error

export const showErrorAlert = ({
  title,
  message,
  buttonText = "Aceptar",
  onClose,
}: CustomAlert) => {
  return {
    title,
    message,
    type: "error" as const,
    buttonText,
    onClose: onClose || (() => {}),
  };
};
