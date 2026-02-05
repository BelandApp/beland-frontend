import { useState, useEffect, useCallback, useMemo } from "react";
import { ProductQuery, Product } from "@/types";
import { ProductService } from "src/services";
import { useCache } from "../cache/useCache";
import { usePagination } from "../pagination/usePagination";
export function useProducts(initialQuery: ProductQuery = {}) {
  const limit = initialQuery.limit ?? 100;

  const [query, setQuery] = useState<ProductQuery>({
    ...initialQuery,
    page: 1,
    limit,
  });
  const cacheKey = useMemo(() => {
    return `products:${JSON.stringify(query)}`;
  }, [query]);
  const { data, loading, error, refresh } = useCache({
    key: cacheKey,
    duration: 3 * 60 * 60 * 1000,
    fetcher: () => ProductService.getProducts(query),
  });

  const pagination = usePagination({
    limit,
    total: data?.total ?? 0,
  });

  // sincronizar page -> query
  useEffect(() => {
    setQuery((q) => ({ ...q, page: pagination.page }));
  }, [pagination.page]);

  const updateQuery = useCallback((partial: Partial<ProductQuery>) => {
    setQuery((prev) => ({
      ...prev,
      ...partial,
      page: 1, // reset page al filtrar
    }));
  }, []);

  return {
    products: data?.data ?? [],
    loading,
    error,
    refresh,
    pagination,
    updateQuery,
  };
}
