import { SetStateAction, useState } from "react";
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors } from "src/styles";


export type TabItem = {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};
type ThemedTabsProps = {
  tabs: TabItem[];
  onTabChange?: (tabKey: string) => void;
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
}) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].label);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };
  return (
    <View style={[styles.container, containerStyle]}>
      {tabs.map(({ label, icon, disabled }) => {
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
              {label}
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
    marginBottom: 16,
    justifyContent: "center",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  activeText: {
    color: colors.primary,
    fontWeight: "600",
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
