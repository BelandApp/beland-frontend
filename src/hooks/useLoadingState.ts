import { useState, useCallback, useRef, useEffect } from "react";

interface LoadingState {
  [key: string]: boolean;
}

/**
 * Hook para manejo avanzado de estados de carga
 * Permite manejar múltiples operaciones de carga simultáneas
 */
export const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const setLoading = useCallback(
    (key: string, isLoading: boolean, minDuration = 0) => {
      if (isLoading) {
        setLoadingStates((prev) => ({ ...prev, [key]: true }));
      } else {
        if (minDuration > 0) {
          // Asegurar duración mínima de loading
          timeoutsRef.current[key] = setTimeout(() => {
            setLoadingStates((prev) => ({ ...prev, [key]: false }));
            delete timeoutsRef.current[key];
          }, minDuration);
        } else {
          setLoadingStates((prev) => ({ ...prev, [key]: false }));
        }
      }
    },
    []
  );

  const isLoading = useCallback(
    (key?: string) => {
      if (key) {
        return loadingStates[key] || false;
      }
      // Si no se especifica key, retorna true si cualquier operación está en loading
      return Object.values(loadingStates).some((loading) => loading);
    },
    [loadingStates]
  );

  const clearLoading = useCallback((key: string) => {
    if (timeoutsRef.current[key]) {
      clearTimeout(timeoutsRef.current[key]);
      delete timeoutsRef.current[key];
    }
    setLoadingStates((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    // Limpiar todos los timeouts
    Object.values(timeoutsRef.current).forEach((timeout) =>
      clearTimeout(timeout)
    );
    timeoutsRef.current = {};
    setLoadingStates({});
  }, []);

  // Wrapper para funciones async
  const withLoading = useCallback(
    <T extends any[], R>(
      key: string,
      fn: (...args: T) => Promise<R>,
      minDuration = 0
    ) => {
      return async (...args: T): Promise<R> => {
        setLoading(key, true);
        try {
          const result = await fn(...args);
          setLoading(key, false, minDuration);
          return result;
        } catch (error) {
          setLoading(key, false, minDuration);
          throw error;
        }
      };
    },
    [setLoading]
  );

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach((timeout) =>
        clearTimeout(timeout)
      );
    };
  }, []);

  return {
    setLoading,
    isLoading,
    clearLoading,
    clearAllLoading,
    withLoading,
    loadingStates,
  };
};
