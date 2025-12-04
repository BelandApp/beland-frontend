import { useState, useEffect, useCallback } from "react";
import { ProductQuery, Product } from "@/types";
import { ProductService } from "src/services";
import { useCache } from "../cache/useCache";

export function useProducts(
  initialQuery: ProductQuery = { page: 1, sortBy: "name", order: "ASC" }
) {
  const [query, setQuery] = useState<ProductQuery>(initialQuery);
  const { data, loading, refresh, error } = useCache({
    key: "products_cache",
    duration: 3 * 60 * 60 * 1000, // 3 horas
    fetcher: () => ProductService.getProducts(query),
  });
  const [page, setPage] = useState(initialQuery.page || 1);
  const [limit, setLimit] = useState(initialQuery.limit || 10);
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  const queryKey = JSON.stringify(query);
  const setProductsFromCache = async () => {
    if (!data) {
      refresh();
      return;
    }
    setProducts(data?.data)
    setLimit(data.limit)
    setPage(data.page)
    setTotal(data.total)
  }
 
  useEffect(() => {
    setProductsFromCache();
  }, [data,query]);
  const updateQuery = useCallback((newQuery: Partial<ProductQuery>) => {
    setQuery((prev) => {
      const next = { ...prev, ...newQuery, page: 1 };

      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, []);

  const goToNextPage = useCallback(() => {
    if (page * limit < total) {
      setQuery((prev) => ({ ...prev, page: prev.page ? prev.page + 1 : 2 }));
    }
  }, [page, limit, total]);

  const goToPreviousPage = useCallback(() => {
    if (page > 1) {
      setQuery((prev) => ({ ...prev, page: prev.page ? prev.page - 1 : 1 }));
    }
  }, [page]);

  return {
    products,
    total,
    page,
    limit,
    loading,
    query,
    updateQuery,
    refresh,
    goToNextPage,
    goToPreviousPage,
    error
  };
}
