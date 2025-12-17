import { useState } from "react";

export interface FilterOptions {
  categories: string[];
  brands: string[];
  minPrice: string;
  maxPrice: string;
  sortBy: "name" | "price" | "created_at" | "sold_count";
  order: "ASC" | "DESC";
}

export const useCatalogFilters = () => {
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    brands: [],
    minPrice: "",
    maxPrice: "",
    sortBy: "name",
    order: "ASC",
  });
  

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
      order: "ASC",
    });
    setSearchText("");
  };
  return {
    searchText,
    setSearchText,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
  };
};
