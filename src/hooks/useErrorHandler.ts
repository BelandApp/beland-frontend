import { useState, useCallback } from "react";
import { useNotification } from "./NotificationContext";

interface ErrorConfig {
  showNotification?: boolean;
  logToConsole?: boolean;
  customMessage?: string;
}

/**
 * Hook para manejo centralizado de errores
 * Proporciona funciones para capturar, procesar y mostrar errores de forma consistente
 */
export const useErrorHandler = () => {
  const [lastError, setLastError] = useState<Error | null>(null);
  const { showNotification } = useNotification();

  const handleError = useCallback(
    (error: any, config: ErrorConfig = {}) => {
      const {
        showNotification: shouldShowNotification = true,
        logToConsole = true,
        customMessage,
      } = config;

      // Procesar el error
      const processedError =
        error instanceof Error
          ? error
          : new Error(typeof error === "string" ? error : "Error desconocido");

      setLastError(processedError);

      // Log del error
      if (logToConsole) {
        console.error("Error capturado:", processedError);
      }

      // Mostrar notificación
      if (shouldShowNotification) {
        const message =
          customMessage || processedError.message || "Ha ocurrido un error";
        showNotification({
          title: "Error",
          message,
          persistent: false,
        });
      }

      return processedError;
    },
    [showNotification]
  );

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  // Wrapper para funciones async que pueden fallar
  const withErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      config?: ErrorConfig
    ) => {
      return async (...args: T): Promise<R | null> => {
        try {
          return await fn(...args);
        } catch (error) {
          handleError(error, config);
          return null;
        }
      };
    },
    [handleError]
  );

  return {
    lastError,
    handleError,
    clearError,
    withErrorHandling,
  };
};
