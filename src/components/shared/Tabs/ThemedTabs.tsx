import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "src/styles";

type ThemedTabsProps = {
  tabs: string[];
  onTabChange?: (tab: string) => void;
};
const ThemedTabs: React.FC<ThemedTabsProps> = ({ tabs, onTabChange }) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange && onTabChange(tab);
  };
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <Pressable
          style={[
            styles.tabButton,
            activeTab === tab && styles.activeTab,
          ]}
          onPress={() => handleTabChange(tab)}
          key={tab}
        >
          <Text
            style={[styles.tabText, activeTab === tab && styles.activeText]}
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "center",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  activeText: {
    color: colors.primary,
    fontWeight: "600",
  },
});
export default ThemedTabs;
