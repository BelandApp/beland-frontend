import { useState, useMemo } from "react";
import { TabItem } from "../ThemedTabs";

type UseThemedTabsInput = string[] | TabItem[];
type FiltersMap<T> = Record<string, (item: T) => boolean>;
export function useThemedTabs<T>(
  initialTabs: UseThemedTabsInput,
  defaultActive?: string
) {
  // Normalizamos a TabItem[]
  const tabs: TabItem[] = useMemo(() => {
    if (typeof initialTabs[0] === "string") {
      return (initialTabs as string[]).map((label) => ({ label }));
    }
    return initialTabs as TabItem[];
  }, [initialTabs]);

  const [activeTab, setActiveTab] = useState<string>(
    defaultActive || tabs[0]?.label || ""
  );

  //  Helper para verificar si una tab está activa
  const isActive = (tabLabel: string) => activeTab === tabLabel;

  const handleTabChange = (tabLabel: string) => setActiveTab(tabLabel);

  /**
   * Función genérica para filtrar data según varios criterios.
   * @param allData - Array completo de elementos.
   * @param filters - Objeto con claves y funciones de filtro.
   * @returns Objeto con { claveFiltro: datosFiltrados }.
   */
  const filterWithTab = <U extends T>(
    allData: U[],
    filters: FiltersMap<U>
  ): Record<keyof typeof filters, U[]> => {
    const result = {} as Record<keyof typeof filters, U[]>;
    for (const key in filters) {
      result[key] = allData.filter(filters[key]);
    }
    return result;
  };

  /**
   * Función para obtener elementos filtrados según la tab activa.
   * @param allData - Array completo de elementos.
   * @param filters - Objeto con claves y funciones de filtro.
   * @returns Objeto con { claveFiltro: datosFiltrados }.
   */
  const getFilteredByActiveTab = <U extends T>(
    allData: U[],
    filters: FiltersMap<U>
  ): U[] => {
    const filterFn = filters[activeTab];
    return filterFn ? allData.filter(filterFn) : allData;
  };
  return {
    tabs,
    activeTab,
    setActiveTab,
    isActive,
    onTabChange: handleTabChange,
    filterWithTab,
    getFilteredByActiveTab,
  };
}
