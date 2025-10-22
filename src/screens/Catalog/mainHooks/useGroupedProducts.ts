// /hooks/useGroupedProducts.ts

import { useMemo } from "react";
import type { Product } from "../../../types";
import { ProductCardType } from "../components";

export type Category = {
  id: string;
  name: string;
};

export type GroupedProduct = {
  category_id: string;
  category_name: string;
  products: ProductCardType[];
};

export const useGroupedProducts = (
  products: Product[],
  allCategories: Category[]
): GroupedProduct[] => {
  return useMemo(() => {
    if (!products || products.length === 0) return [];

    const groups: Record<string, GroupedProduct> = {};

    for (const product of products) {
      let categoryId = product.category_id || "uncategorized";
      let categoryName = "Sin categoría";

      if (product.category_id) {
        const categoryInfo = allCategories.find((c) => c.id === categoryId);
        if (categoryInfo?.name) {
          categoryName = categoryInfo.name;
        } else {
          // Si no encontramos la categoría en allCategories, usar el product.category como fallback
          categoryName = (product as any).category || "Sin categoría";
          categoryId = `fallback_${product.category_id}`;
        }
      } else if ((product as any).category) {
        // Si no hay category_id pero sí hay category string
        categoryName = (product as any).category;
        categoryId = `string_${(product as any).category}`;
      }

      if (!groups[categoryId]) {
        groups[categoryId] = {
          category_id: categoryId,
          category_name: categoryName,
          products: [],
        };
      }

      groups[categoryId].products.push(product as unknown as ProductCardType);
    }

    const sortedGroups = Object.values(groups).sort((a, b) => {
      if (a.category_name === "Productos Circulares") return -1;
      if (b.category_name === "Productos Circulares") return 1;
      return 0;
    });

    return sortedGroups;
  }, [products, allCategories]);
};
