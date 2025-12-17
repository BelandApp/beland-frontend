import { useMemo, useEffect, useRef } from "react";
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
  const { products, loading, updateQuery, refresh, error } = useProducts();

  const lastQueryRef = useRef<string>("");

  /* ---------------- BACKEND QUERY ---------------- */

  const query = useMemo(
    () => ({
      page: 1,
      category_id: filters.categories?.length
        ? categories.find((c) => c.name === filters.categories[0])?.id
        : undefined,
    }),
    [filters.categories, categories]
  );

  useEffect(() => {
    const serialized = JSON.stringify(query);
    if (serialized !== lastQueryRef.current) {
      lastQueryRef.current = serialized;
      updateQuery(query);
    }
  }, [query]);

  /* ---------------- FRONTEND FILTERING ---------------- */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 🔎 búsqueda por texto
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // 💲 precio mínimo
    if (filters.minPrice) {
      result = result.filter((p) => p.price >= Number(filters.minPrice));
    }
    if (filters.categories?.length) {
      result = result.filter((p) => p.category?.name === filters.categories[0]);
    }
    // 💲 precio máximo
    if (filters.maxPrice) {
      result = result.filter((p) => p.price <= Number(filters.maxPrice));
    }

    // 🔁 ordenamiento
    if (filters.sortBy) {
      result.sort((a, b) => {
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
    }

    return result;
  }, [products, searchText, filters]);

  return {
    loading,
    products: filteredProducts,
    refresh,
    error,
  };
};
