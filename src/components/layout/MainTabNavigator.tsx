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
  WalletIcon,
  CatalogIcon,
  CommunityIcon,
} from "@components/icons";

import EventsScreen from "src/screens/Events/EventsScreen";
import { CustomTabBar } from "./customTabBar/CustomTabBar";
import { ShoppingBag, TicketCheck } from "lucide-react-native";

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
          tabBarHideOnKeyboard: true,
          headerShown: false,
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
            headerShown: false,
            tabBarLabel: "Home",
            tabBarIcon: ({ focused }) => (
              <HomeIcon color={focused ? "#000" : "#777"} />
            ),
          }}
        />

        <Tab.Screen
          name="Wallet"
          component={WalletScreen}
          options={{
            headerShown: false,
            tabBarLabel: "Becoins",
            tabBarIcon: ({ focused }) => (
              <WalletIcon color={focused ? "#000" : "#777"} />
            ),
          }}
        />

        <Tab.Screen
          name="Catalog"
          component={CatalogScreen}
          options={{
            headerShown: false,
            tabBarLabel: "Catalogo",
            tabBarIcon: ({ focused }) => (
              <ShoppingBag color={focused ? "#000" : "#777"} />
            ),
          }}
        />

        <Tab.Screen
          name="Events"
          component={EventsScreen}
          options={{
            headerShown: false,
            tabBarLabel: "Eventos",
            tabBarIcon: ({ focused }) => (
              <TicketCheck color={focused ? "#000" : "#777"} />
            ),
          }}
        />
        <Tab.Screen
          name="Groups"
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
