import { ProductService } from "src/services";
import { Category } from "src/types";
import { useCache } from "../cache/useCache";

export const useCategories = () => {
  const { data, loading, refresh, clear } = useCache<Category[]>({
    key: "categories_cache",
    duration: 6 * 60 * 60 * 1000, // 6 horas
    fetcher: () => ProductService.getCategories().then((res) => res.data),
  });

  return {
    categories: data ?? [],
    loading,
    refresh,
    clear,
  };
};
