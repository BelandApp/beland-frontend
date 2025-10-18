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
      const categoryId = product.category_id || "uncategorized";
      let categoryName = "Sin categoría";

      if (product.category_id) {
        const categoryInfo = allCategories.find((c) => c.id === categoryId);
        if (categoryInfo?.name) {
          categoryName = categoryInfo.name;
        }
      }

      if (!groups[categoryId]) {
        groups[categoryId] = {
          category_id: categoryId,
          category_name: categoryName,
          products: [],
        };
      }

      groups[categoryId].products.push(product);
    }

    const sortedGroups = Object.values(groups).sort((a, b) => {
      if (a.category_name === "Productos Circulares") return -1;
      if (b.category_name === "Productos Circulares") return 1;
      return 0;
    });

    return sortedGroups;
  }, [products, allCategories]);
};
