import { storage } from "src/stores/storeEngine";


const CACHE_KEY = "products_cache";
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 horas



type CacheEntry = {
  timestamp: number;
  queryKey: string;
  data: any;
};

const memoryCache = new Map<string, CacheEntry>();

export async function setProductCache(queryKey: string, data: any) {
  const entry: CacheEntry = {
    timestamp: Date.now(),
    queryKey,
    data,
  };

  memoryCache.set(queryKey, entry);
  await storage.setItem(CACHE_KEY + queryKey, JSON.stringify(entry));
}

export async function getProductCache(queryKey: string) {
  // Primero mirar memoria
  const mem = memoryCache.get(queryKey);
  if (mem && Date.now() - mem.timestamp < CACHE_DURATION) return mem.data;

  // Si no está en memoria, buscar AsyncStorage
  const json = await storage.getItem(CACHE_KEY + queryKey);
  if (!json) return null;

  const entry: CacheEntry = JSON.parse(json);
  if (Date.now() - entry.timestamp > CACHE_DURATION) return null;

  // Restaurarlo en memoria para acceso rápido
  memoryCache.set(queryKey, entry);

  return entry.data;
}

export async function clearProductCache() {
  memoryCache.clear();
  const keys = await storage.getAllKeys();
  const productKeys = keys.filter((k) => k.startsWith(CACHE_KEY));
  await Promise.all(productKeys.map((key) => storage.removeItem(key)));
}
