// hooks/useFilteredProducts.ts
import { useMemo, useEffect, useRef } from "react";
import { useGroupedProducts } from "../mainHooks/useGroupedProducts";
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
  const { products, loading, updateQuery, refresh, error } =
    useProducts();
  const lastQueryRef = useRef<string>("");

  const query = useMemo(() => {
    return {
      page: 1,
      name: searchText || undefined,
      category_id: filters.categories?.length
        ? categories.find((c) => c.name === filters.categories[0])?.id
        : undefined,
      sortBy: filters.sortBy || undefined,
      order: filters.order || undefined,
    };
  }, [searchText, filters, categories]);

  // Evita peticiones a la API repetidas
  useEffect(() => {
    const serialized = JSON.stringify(query);
    if (serialized !== lastQueryRef.current) {
      lastQueryRef.current = serialized;
      updateQuery(query);
    }
  }, [query]);

  const grouped = useGroupedProducts(products, categories);

  const displayGroups = useMemo(() => {
    if (!products.length) return [];

    if (grouped.length === 0) {
      return [{ categoryId: "all", category: "Todos", products }];
    }

    return grouped.map((g) => ({
      categoryId: g.category_id,
      category: g.category_name,
      products: g.products,
    }));
  }, [grouped, products]);

  return { loading, products, displayGroups, refresh,error };
};
