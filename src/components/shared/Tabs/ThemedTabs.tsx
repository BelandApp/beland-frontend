import { SetStateAction, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "src/styles";

export type TabItem = {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  count?: number | string;
};
type ThemedTabsProps = {
  tabs: TabItem[];
  onTabChange?: (tabKey: string) => void;
  initalTab?: string;
  /** Estilos personalizados */
  containerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const ThemedTabs: React.FC<ThemedTabsProps> = ({
  tabs,
  onTabChange,
  containerStyle,
  tabStyle,
  textStyle,
  initalTab,
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    initalTab ? initalTab : tabs[0].label,
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };
  return (
    <View style={[styles.container, containerStyle]}>
      {tabs.map(({ label, icon, disabled, count }) => {
        const isActive = label === activeTab;
        return (
          <Pressable
            key={label + " tab"}
            onPress={() => !disabled && handleTabChange(label)}
            disabled={disabled}
            style={[
              styles.tab,
              tabStyle,
              isActive && styles.activeTab,
              disabled && styles.disabled,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive, disabled }}
          >
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              style={[
                styles.text,
                textStyle,
                isActive && styles.activeText,
                disabled && styles.disabledText,
              ]}
            >
              {label} {count}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: colors.belandOrange,
  },
  text: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.textSecondary,
  },
  activeText: {
    color: "#FFFFFF",
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  icon: {
    marginRight: 4,
  },
});
export default ThemedTabs;
