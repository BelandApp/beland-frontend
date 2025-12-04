import { useEffect, useState, useCallback } from "react";
import { storage } from "@/stores";
import { getBackendErrorMessage } from "src/services";

// FORMA DE USAR
// const { data } = useCache({
//   key: "categories_cache", --string--
//   duration: 6 * 60 * 60 * 1000, --number en ms--
//   fetcher: () => ProductService.getCategories(), --Promise o Service--
// });

interface UseCacheParams<T> {
  key: string;
  duration: number; // ms
  fetcher: () => Promise<T>;
}

export function useCache<T>({ key, duration, fetcher }: UseCacheParams<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    const cachedRaw = await storage.getItem(key);
    let cached: { value: T; expireAt: number } | null = null;
    if (cachedRaw) {
      try {
        cached = JSON.parse(cachedRaw);
      } catch (e) {
        console.warn("Cache inválido, limpiando...");
        await storage.removeItem(key);
      }
    }
    // Validar expiración
    if (cached && cached.expireAt > Date.now()) {
      setData(cached.value);
      setLoading(false);
      return;
    }

    // Fetch nuevo contenido
    try {
      const freshData = await fetcher();
      const newData = { value: freshData, expireAt: Date.now() + duration };
      await storage.setItem(key, JSON.stringify(newData));
      setData(freshData);
    } catch (error) {
      const message = getBackendErrorMessage(error);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [key, duration, fetcher]);

  useEffect(() => {
    load();
  }, []);

  const refresh = async () => {
    const freshData = await fetcher();
    const newData = { value: freshData, expireAt: Date.now() + duration };
    await storage.setItem(key, JSON.stringify(newData));
    setData(freshData);
  };

  const clear = async () => {
    await storage.removeItem(key);
    setData(null);
  };

  return { data, loading, refresh, clear, error };
}
