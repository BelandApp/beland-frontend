import { useState, useEffect } from "react";
import { FilterOptions } from "./useCatalogFilters";
import { CatalogTab } from "../types/catalogTabs";

const isSameTab = (a: CatalogTab | null, b: CatalogTab) =>
  JSON.stringify(a) === JSON.stringify(b);

export const useCatalogTabs = (
  setFilters: (fn: (prev: FilterOptions) => FilterOptions) => void
) => {
  const [activeTab, setActiveTab] = useState<CatalogTab | null>({type:"ALL"});

  const toggleTab = (tab: CatalogTab) => {
    setActiveTab((prev) => (isSameTab(prev, tab) ? null : tab));
  };
  
  useEffect(() => {
    setFilters((prev) => {
      if (!activeTab) {
        return {
          ...prev,
          categories: [],
          sortBy: "name",
          order: "ASC",
        };
      }

      switch (activeTab.type) {
        case "ALL":
          return {
            ...prev,
            categories: [],
            sortBy: "name",
            order: "ASC",
          };

        case "CATEGORY":
          return {
            ...prev,
            categories: [activeTab.categoryName],
            sortBy: "name",
            order: "ASC",
          };

        case "SORT":
          return {
            ...prev,
            categories: [],
            sortBy: activeTab.sortBy,
            order: activeTab.order,
          };

        default:
          return prev;
      }
    });
  }, [activeTab]);

  return {
    activeTab,
    toggleTab,
  };
};
