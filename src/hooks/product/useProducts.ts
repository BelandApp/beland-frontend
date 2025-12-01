import { useState, useEffect, useCallback } from "react";
import { ProductQuery, Product } from "@/types";
import { ProductService } from "src/services";
import { getProductCache, setProductCache } from "./productCache";

export function useProducts(
  initialQuery: ProductQuery = { page: 1, sortBy: "name", order: "ASC" }
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialQuery.page || 1);
  const [limit, setLimit] = useState(initialQuery.limit || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<ProductQuery>(initialQuery);
  const [forceRefresh, setForceRefresh] = useState(false);

  const queryKey = JSON.stringify(query);

  const fetchProducts = useCallback(
    async (overrideQuery?: ProductQuery) => {
      setLoading(true);
      setError(null);

      const finalQuery = { ...query, ...overrideQuery };
      const queryKey = JSON.stringify(finalQuery);

      try {
        // 1️⃣ Intentar cache (solo si no es force refresh)
        if (!forceRefresh) {
          const cached = await getProductCache(queryKey);
          if (cached) {
            setProducts(cached.data);
            setTotal(cached.total);
            setPage(cached.page);
            setLimit(cached.limit);
            setLoading(false);
            return;
          }
        }

        // 2️⃣ Si no hay cache → fetch real
        const res = await ProductService.getProducts(finalQuery);

        setProducts(res.data);
        setTotal(res.total);
        setPage(res.page);
        setLimit(res.limit);

        // 3️⃣ Guardar en cache para futuras consultas
        await setProductCache(queryKey, res);
      } catch (err: any) {
        setError(err.message || "Error al cargar productos");
      } finally {
        setForceRefresh(false);
        setLoading(false);
      }
    },
    [query, forceRefresh]
  );

  useEffect(() => {
    fetchProducts();
  }, [query, forceRefresh]);

  const updateQuery = useCallback((newQuery: Partial<ProductQuery>) => {
    setQuery((prev) => {
      const next = { ...prev, ...newQuery, page: 1 };

      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, []);

  /** 🔄 Manual refresh (pull-to-refresh or triggered by checkout/admin action) */
  const refreshProducts = useCallback(async () => {
    setForceRefresh(true);
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
    error,
    query,
    updateQuery,
    refreshProducts,
    goToNextPage,
    goToPreviousPage,
  };
}
