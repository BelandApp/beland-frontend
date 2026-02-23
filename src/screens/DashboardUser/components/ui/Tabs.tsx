import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useResponsiveLayout } from "@/hooks";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  const { isMobile } = useResponsiveLayout();

  return (
    <View style={styles.container}>
      <View
        style={[styles.tabsContainer, isMobile && styles.tabsContainerMobile]}
      >
        {isMobile ? (
          <View style={styles.tabsGridMobile}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabMobile,
                  activeTab === tab.id && styles.activeTab,
                ]}
                onPress={() => onTabChange(tab.id)}
              >
                {tab.icon && <View style={styles.iconMobile}>{tab.icon}</View>}
                <Text
                  style={[
                    styles.tabLabelMobile,
                    activeTab === tab.id && styles.activeTabLabel,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => onTabChange(tab.id)}
              >
                {tab.icon && <View style={styles.icon}>{tab.icon}</View>}
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === tab.id && styles.activeTabLabel,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  tabsContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    height: 55,
    marginHorizontal: 30,
    borderRadius: 12,
    marginTop: 10,
    flexShrink: 0,
  },
  tabsContainerMobile: {
    maxHeight: "auto",
    paddingVertical: 12,
  },
  tabsGridMobile: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
    justifyContent: "space-between",
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
    flexShrink: 0,
  },
  tabMobile: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    minWidth: "18%",
    maxWidth: "19%",
  },
  activeTab: {
    backgroundColor: "#FF6B35",
  },
  icon: {
    width: 18,
    height: 18,
  },
  iconMobile: {
    width: 20,
    height: 20,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  tabLabelMobile: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  activeTabLabel: {
    color: "#fff",
  },
  content: {
    minHeight: 500,
  },
});
