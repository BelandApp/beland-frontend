import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "@screens/HomeScreen";
import { WalletScreen } from "@screens/WalletScreen";
import { CatalogScreen } from "@screens/CatalogScreen";
import { GroupsStackNavigator } from "./GroupsStackNavigator";
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
  GroupIcon,
} from "@components/icons";

import EventsScreen from "src/screens/Events/EventsScreen";
import { CustomTabBar } from "./customTabBar/CustomTabBar";
import { TicketCheck } from "lucide-react-native";

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
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
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ focused }) => (
              <HomeIcon color={focused ? "#000" : "#777"} />
            ),
          }}
        />

        <Tab.Screen
          name="Billetera"
          component={WalletScreen}
          options={{
            tabBarLabel: "Wallet",
            tabBarIcon: ({ focused }) => (
              <WalletIcon color={focused ? "#000" : "#777"} />
            ),
          }}
        />

        <Tab.Screen
          name="Catalogo"
          component={CatalogScreen}
          options={{
            tabBarLabel: "Catalogo",
            tabBarIcon: ({ focused }) => (
              <CatalogIcon color={focused ? "#000" : "#777"} />
            ),
          }}
        />

        <Tab.Screen
          name="Eventos"
          component={EventsScreen}
          options={{
            tabBarLabel: "Eventos",
            tabBarIcon: ({ focused }) => (
              <TicketCheck color={focused ? "#000" : "#777"} />
            ),
          }}
        />
        <Tab.Screen
          name="Grupos"
          component={GroupsStackNavigator}
          options={{
            tabBarLabel: "Grupos",
            tabBarIcon: ({ focused }) => (
              <CommunityIcon color={focused ? "#000" : "#777"} />
            ),
          }}
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
