import { CatalogTab } from "../types/catalogTabs";
import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";

export const buildCatalogTabs = (
  categories: { name: string }[]
): { tab: CatalogTab; label: string }[] => {
  return [
    { tab: { type: "ALL" }, label: "Todos" },
    {
      tab: { type: "SORT", sortBy: "sold_count", order: "DESC" },
      label: "Más vendidos",
    },
    ...categories.map((c) => ({
      tab: { type: "CATEGORY" as const, categoryName: c.name },
      label: c.name,
    })),
    {
      tab: { type: "SORT", sortBy: "price", order: "ASC" },
      label: "Más baratos",
    },
  ];
};
interface Props {
  tabs: { tab: CatalogTab; label: string }[];
  activeTab: CatalogTab | null;
  onPress: (tab: CatalogTab) => void;
}
export const CatalogTabs: React.FC<Props> = ({ activeTab, tabs, onPress }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: 12 }}
    >
      {tabs.map((tab) => {
       const isActive =
          activeTab && JSON.stringify(activeTab) === JSON.stringify(tab.tab);
        return (
          <TouchableOpacity
            key={tab.label}
            onPress={() => onPress(tab.tab)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: isActive ? "#FF6B35" : "#F2F2F2",
            }}
          >
            <Text
              style={{
                color: isActive ? "#FFF" : "#333",
                fontWeight: "600",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};