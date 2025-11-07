import { useState, useMemo } from "react";
import { TabItem } from "../ThemedTabs";

type UseThemedTabsInput = string[] | TabItem[];

export function useThemedTabs(
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

  const filterWithTab = (allData: any) => {
    return allData.filter((data: any) => data.category === activeTab);
  }

  return {
    tabs,
    activeTab,
    setActiveTab,
    isActive,
    onTabChange: handleTabChange,
    filterWithTab,
  };
}
