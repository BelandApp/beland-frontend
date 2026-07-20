import { useMemo, useEffect, useRef, useState } from "react";
import { useProducts } from "src/hooks";

export const useFilteredProducts = ({
  searchText,
  filters,
  categories,
}: {
  searchText: string;
  filters: any;
  categories: { id: string; name: string }[];
}) => {
  const {
    products,
    circularProducts,
    loading,
    pagination,
    updateQuery,
    error,
    refresh,
  } = useProducts();

  /* ---------------- BACKEND QUERY ---------------- */

  useEffect(() => {
    updateQuery({
      category_id: filters.categories?.[0]
        ? categories.find((c) => c.name === filters.categories[0])?.id
        : undefined,
      sortBy: filters.sortBy,
      order: filters.order,
    });
  }, [filters]);

  /* ---------------- FRONTEND FILTERING ---------------- */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /* filtros */
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q),
      );
    }

    if (filters.minPrice) {
      result = result.filter((p) => p.price >= Number(filters.minPrice));
    }

    if (filters.maxPrice) {
      result = result.filter((p) => p.price <= Number(filters.maxPrice));
    }

    if (filters.categories?.length) {
      result = result.filter((p) => p.category?.name === filters.categories[0]);
    }

    /* 🔁 SORT FINAL (stock SIEMPRE primero) */
    result.sort((a, b) => {
      const aHasStock = a.stock > 0;
      const bHasStock = b.stock > 0;

      // 1️⃣ prioridad: stock
      if (aHasStock !== bHasStock) {
        return aHasStock ? -1 : 1;
      }

      // 2️⃣ luego criterio elegido
      if (!filters.sortBy) return 0;

      const dir = filters.order === "DESC" ? -1 : 1;

      switch (filters.sortBy) {
        case "price":
          return (a.price - b.price) * dir;

        case "created_at":
          return (
            (new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()) *
            dir
          );

        case "name":
        default:
          return a.name.localeCompare(b.name) * dir;
      }
    });

    return result;
  }, [products, searchText, filters]);

  return {
    loading,
    products: filteredProducts,
    circularProducts,
    pagination,
    refresh,
    error,
  };
};
