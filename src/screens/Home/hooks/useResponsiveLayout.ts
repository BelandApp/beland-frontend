import { useState, useEffect } from "react";
import { Dimensions, Platform } from "react-native";

interface ResponsiveLayout {
  isWeb: boolean;
  isNative: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
}

export const useResponsiveLayout = (): ResponsiveLayout => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get("window"));

  useEffect(() => {
    if (Platform.OS === "web") {
      const subscription = Dimensions.addEventListener(
        "change",
        ({ window }) => {
          setDimensions(window);
        },
      );

      return () => subscription?.remove();
    }
  }, []);

  const screenWidth = dimensions.width;
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;
  const isWeb = Platform.OS === "web";
  const isNative = Platform.OS === "ios" || Platform.OS === "android";
  return {
    isWeb,
    isNative,
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
  };
};
