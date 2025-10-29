import { useMemo, useRef, useLayoutEffect, useState } from "react";
import { ProductService } from "@services/core";
import { ProductCardType } from "../components/ProductCard";

interface Category {
  id: string;
  name: string;
}

interface ProductGroup {
  category: string;
  items: ProductCardType[];
}

export const useProductGrouping = (products: ProductCardType[] | undefined) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  // Guardar el orden inicial de las categorías para evitar reordenamientos
  const initialCategoryOrderRef = useRef<string[] | null>(null);

  // Cargar categorías al montar el componente
  useLayoutEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await ProductService.getCategories();
        setAllCategories(
          categories.map((cat) => ({ id: cat.id, name: cat.name }))
        );
      } catch (e: any) {
        console.error("[CATEGORIAS] Error al cargar categorías:", e);
      }
    };

    loadCategories();
  }, []);

  // Función para normalizar categoría de un producto
  const normalizeCategoryFromProduct = (product: any) => {
    // Intentar category_id primero
    if (product.category_id) {
      return {
        key: `id:${String(product.category_id)}`,
        displayName: undefined,
      };
    }

    const cat = product.category;
    if (!cat) return { key: "__uncategorized", displayName: undefined };

    if (typeof cat === "string") {
      const trimmed = cat.trim();
      return trimmed
        ? { key: `name:${trimmed}`, displayName: trimmed }
        : { key: "__uncategorized", displayName: undefined };
    }

    // Si category es un objeto, extraer id/name
    if (typeof cat === "object") {
      const maybeId = cat.id || cat._id || cat.category_id;
      const maybeName = cat.name || cat.title || cat.label;

      if (maybeId) {
        return { key: `id:${String(maybeId)}`, displayName: maybeName };
      }
      if (maybeName) {
        return {
          key: `name:${String(maybeName).trim()}`,
          displayName: String(maybeName).trim(),
        };
      }
    }

    return { key: "__uncategorized", displayName: undefined };
  };

  // Agrupar productos por categoría
  const groupedProducts = useMemo(() => {
    if (!products || products.length === 0) return [] as ProductGroup[];

    type Key = string;
    const map: Record<Key, ProductCardType[]> = {};

    products.forEach((product: any) => {
      const info = normalizeCategoryFromProduct(product);
      const key: Key = info.key;
      if (!map[key]) map[key] = [];
      map[key].push(product);
    });

    const entries = Object.keys(map).map((key) => {
      let categoryName: string | undefined;

      if (key === "__uncategorized") {
        categoryName = "Sin categoría";
      } else if (key.startsWith("id:")) {
        const id = key.slice(3);
        const found = allCategories.find((c) => c.id === id);
        categoryName = found ? found.name : id;
      } else if (key.startsWith("name:")) {
        categoryName = key.slice(5);
      } else {
        categoryName = key;
      }

      return { key, categoryName, items: map[key] };
    });

    // Establecer orden inicial de categorías
    if (!initialCategoryOrderRef.current) {
      if (allCategories && allCategories.length > 0) {
        const namesOrder = allCategories.map((c) => c.name);
        const present = entries
          .map((e) => e.categoryName)
          .filter((n) => namesOrder.includes(n));
        const others = entries
          .map((e) => e.categoryName)
          .filter((n) => !namesOrder.includes(n));
        initialCategoryOrderRef.current = [...present, ...others];
      } else {
        initialCategoryOrderRef.current = entries.map((e) => e.categoryName);
      }
    }

    const order =
      initialCategoryOrderRef.current || entries.map((e) => e.categoryName);

    // Ordenar usando el mapa de orden
    entries.sort((a, b) => {
      const ia = order.indexOf(a.categoryName || "");
      const ib = order.indexOf(b.categoryName || "");
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return (a.categoryName || "").localeCompare(b.categoryName || "");
    });

    // Asegurar que 'Productos Circulares' esté al principio si existe
    const circIdx = entries.findIndex(
      (e) => e.categoryName === "Productos Circulares"
    );
    if (circIdx > 0) {
      const [circ] = entries.splice(circIdx, 1);
      entries.unshift(circ);
    }

    return entries.map((e) => ({
      category: e.categoryName || "Sin categoría",
      items: e.items,
    }));
  }, [products, allCategories]);

  // Grupos de display con fallback
  const displayGroups = useMemo(() => {
    if (groupedProducts && groupedProducts.length > 0) return groupedProducts;
    if (products && products.length > 0) {
      return [
        {
          category: "Todos",
          items: products as ProductCardType[],
        },
      ];
    }
    return [] as ProductGroup[];
  }, [groupedProducts, products]);

  return {
    groupedProducts,
    displayGroups,
    allCategories,
    setAllCategories,
  };
};
