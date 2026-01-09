import React from "react";
import { View, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "@styles/colors";
import { HomeScreen } from "@screens/HomeScreen";
import { WalletScreen } from "@screens/WalletScreen";
import { CatalogScreen } from "@screens/CatalogScreen";
import { GroupsStackNavigator } from "./GroupsStackNavigator";
import { useAuth } from "@/context";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";
import {
  OnboardingOverlay,
  NAVBAR_TOUR_STEPS,
} from "@/components/onboarding/OnboardingTooltip";

import {
  HomeIcon,
  QRIcon,
  WalletIcon,
  CatalogIcon,
  OrderIcon,
  CommunityIcon,
} from "@components/icons";

import EventsScreen from "src/screens/Events/EventsScreen";

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { user } = useAuth(); // Usar el hook de autenticación

  // Onboarding tour
  const {
    showTour,
    currentStep,
    isLoading,
    nextStep,
    previousStep,
    completeTour,
    skipTour,
  } = useOnboardingTour();

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const iconProps = {
              width: size,
              height: size,
              color: focused ? colors.belandOrange : colors.textSecondary,
            };

            switch (route.name) {
              case "Home":
                return <HomeIcon {...iconProps} />;
              case "QR":
                return <QRIcon {...iconProps} />;
              case "Wallet":
                return <WalletIcon {...iconProps} />;
              case "Community":
                return <CommunityIcon {...iconProps} />;
              case "Catalog":
                return <CatalogIcon {...iconProps} />;
              case "Orders":
                return <OrderIcon {...iconProps} />;
              default:
                return <HomeIcon {...iconProps} />;
            }
          },
          tabBarActiveTintColor: colors.belandOrange,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarAllowFontScaling: false,
          tabBarBackground: () => (
            <View
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                overflow: "hidden",
              }}
            />
          ),
          tabBarStyle: (() => {
            const baseStyle = {
              backgroundColor: "#FFFFFF",
              borderTopWidth: 0,
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              paddingTop: 8,
            };
            if (
              Platform.OS === "web" &&
              typeof window !== "undefined" &&
              window.innerWidth < 600
            ) {
              return {
                ...baseStyle,
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 90, // Altura aumentada para dejar más espacio
                zIndex: 9999,
              };
            }
            return {
              ...baseStyle,
              paddingBottom: Platform.OS === "ios" ? 20 : 0,
              height: Platform.OS === "ios" ? 80 : 60,
            };
          })(),
          tabBarItemStyle: {
            paddingHorizontal: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            marginTop: 4,
            marginBottom: Platform.OS === "android" ? 4 : 0,
          },
          headerShown: false,
          tabBarHideOnKeyboard: true,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: "Home" }}
        />

        <Tab.Screen
          name="Wallet"
          component={WalletScreen}
          options={{ tabBarLabel: "Wallet" }}
        />

        <Tab.Screen
          name="Catalog"
          component={CatalogScreen}
          options={{ tabBarLabel: "Catálogo" }}
        />

        <Tab.Screen
          name="Community"
          component={EventsScreen}
          options={{ tabBarLabel: "Eventos" }}
        />
        <Tab.Screen
          name="Groups"
          component={GroupsStackNavigator}
          options={{ tabBarLabel: "Grupos" }}
        />
      </Tab.Navigator>

      {/* Onboarding Tour Overlay */}
      {!isLoading && showTour && (
        <OnboardingOverlay
          visible={showTour}
          currentStep={currentStep}
          totalSteps={NAVBAR_TOUR_STEPS.length}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipTour}
          onComplete={completeTour}
        />
      )}
    </>
  );
};
