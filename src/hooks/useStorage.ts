import { useState, useEffect, useCallback } from "react";

type StoredValue<T> = T | null;

/**
 * Hook para manejo seguro de localStorage/sessionStorage
 * Incluye serialización automática, manejo de errores y sincronización
 */
export const useStorage = <T>(
  key: string,
  defaultValue?: T,
  storageType: "localStorage" | "sessionStorage" = "localStorage"
) => {
  const storage =
    storageType === "localStorage" ? localStorage : sessionStorage;

  // Función para leer del storage
  const readFromStorage = useCallback((): StoredValue<T> => {
    try {
      const item = storage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      return JSON.parse(item);
    } catch (error) {
      return defaultValue || null;
    }
  }, [key, defaultValue, storage, storageType]);

  const [storedValue, setStoredValue] =
    useState<StoredValue<T>>(readFromStorage);

  // Función para escribir al storage
  const setValue = useCallback(
    (value: T | ((prev: StoredValue<T>) => T)) => {
      try {
        const valueToStore =
          typeof value === "function"
            ? (value as (prev: StoredValue<T>) => T)(storedValue)
            : value;

        setStoredValue(valueToStore);

        if (valueToStore === null || valueToStore === undefined) {
          storage.removeItem(key);
        } else {
          storage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting ${storageType} key "${key}":`, error);
      }
    },
    [key, storedValue, storage, storageType]
  );

  // Función para eliminar del storage
  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setStoredValue(null);
    } catch (error) {
      console.error(`Error removing ${storageType} key "${key}":`, error);
    }
  }, [key, storage, storageType]);

  // Función para verificar si existe en storage
  const hasValue = useCallback(() => {
    return storage.getItem(key) !== null;
  }, [key, storage]);

  // Sincronizar cambios desde otros tabs/ventanas (solo localStorage)
  useEffect(() => {
    if (storageType !== "localStorage") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === localStorage) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : null;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, storageType]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    hasValue,
  };
};

/**
 * Hook específico para localStorage
 */
export const useLocalStorage = <T>(key: string, defaultValue?: T) => {
  return useStorage(key, defaultValue, "localStorage");
};

/**
 * Hook específico para sessionStorage
 */
export const useSessionStorage = <T>(key: string, defaultValue?: T) => {
  return useStorage(key, defaultValue, "sessionStorage");
};
