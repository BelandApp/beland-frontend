import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "./styles";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useCustomNavigation } from "src/hooks";
export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { navigate } = useCustomNavigation();

  const handleNavigateFloatButton = () => {
    // State.index === 4 its groups tab
    state.index === 4 ? navigate("CreateGroup") : navigate("QR");
  };
  return (
    <View style={styles.wrapper}>
      {/* Glass Container */}
      <BlurView intensity={80} tint="light" style={styles.glassContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.activeTab]}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? "#000" : "#777",
                size: 22,
              })}

              {isFocused && (
                <Text style={styles.label}>
                  {options.tabBarLabel?.toString()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </BlurView>

      {/* QR Floating Button */}
      <TouchableOpacity
        style={styles.qrButton}
        onPress={handleNavigateFloatButton}
      >
        <MaterialCommunityIcons
          name={state.index !== 4 ? "qrcode" : "plus"}
          size={26}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
};
