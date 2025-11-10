import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MainTabNavigator } from "./MainTabNavigator";
import CanjearScreen from "../../screens/Wallet/CanjearScreen";
import WithdrawMethodScreen from "../../screens/Wallet/WithdrawMethodScreen";
import { ReceiveScreen, CobrarScreen } from "src/screens/Wallet";
import SendScreen from "../../screens/Wallet/SendScreen";
import WalletHistoryScreen from "../../screens/Wallet/WalletHistoryScreen";
import RechargeScreen from "../../screens/Wallet/RechargeScreen";
import WalletSettingsScreen from "../../screens/Wallet/WalletSettingsScreen";
import { QRScannerScreen } from "../../screens/QRScannerScreen";
import PaymentScreen from "../../screens/Payment/PaymentScreen";
import { HistoryScreen, RecyclingMapScreen } from "../../screens";
import UserDashboardScreen from "src/screens/UserDashboardScreen";
import UserResourcesScreen from "src/screens/UserResources/UserResourcesScreen";

import PayphoneSuccessScreen from "../../screens/Wallet/PayphoneSuccessScreen";
import { CatalogScreen } from "src/screens/Catalog";
import { LoginScreen } from "src/screens/Login";
import { RegisterScreen } from "src/screens/Register";
import { OrdersStackNavigator } from "./OrdersStackNavigator";
import { RewardsScreen } from "src/screens/Rewards";

import { EventModal } from "src/screens/Events/Event.modal";
import {
  NewPaymentScreen,
  PaymentScreenRoute,
} from "src/screens/NewPayment/NewPaymentScreen";
import EventsManagementScreen from "src/screens/DashboardUser/EventsManagementScreen";
import UsersManagementScreen from "src/screens/DashboardUser/UsersManagementScreen";

import { UseEventScreen } from "src/screens/UseEventScreen/UseEventScreen";
import { QRUseEventScreen } from "src/screens/UseEventScreen/QrEvent.scanner";
import { ConsumedEventScreen } from "src/screens/UseEventScreen/ConsumeEvent";
import { AcquiredEventModal } from "src/screens/Events/AcquiredEvent.modal";
import NewPasswordScreen from "src/screens/NewPassword/NewPassword.screen";
import { GroupsStackNavigator } from "./GroupsStackNavigator";
import { GroupsStackParamList, MainTabParamList, OrdersStackParamList } from "src/types/navigation";
import { Order } from "src/types";

export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  Register: undefined;
  NewPassword: undefined;
  // Main Screens
  MainTabs: undefined;
  Orders: undefined;
  // Payments
  CobrarScreen: undefined;
  SendScreen: undefined;
  ReceiveScreen: undefined;
  HistoryScreen: undefined;
  WalletHistoryScreen: undefined;
  RechargeScreen: undefined;
  WalletSettingsScreen: undefined;
  PaymentScreen: {
    paymentData: {
      amount: number;
      message?: string;
      resource?: {
        id: string;
        resource_name: string;
        resource_desc: string;
        resource_quanity: number;
        resource_discount: number;
      }[];
      wallet_id?: string;
    };
    amount_to_payment_id?: string | null;
  };
  NewPaymentScreen: PaymentScreenRoute;
  PayphoneSuccess: { toWalletId: string; amountPaymentId: string };

  // Users
  Dashboard: undefined;
  UserDashboardScreen: undefined;
  UserResources: undefined;
  CommerceDashboard: undefined;
  Wallet: undefined;
  QR: { pendingRedemption?: any } | undefined;
  RecyclingMap: undefined;
  CanjearScreen: undefined;
  WithdrawMethodScreen: {
    beCoinsAmount: number;
    usdAmount: number;
  };

  // Admin Management Screens
  EventsManagement: undefined;
  UsersManagement: undefined;
  ProductsManagement: undefined;

  // Events Screens
  EventModal: { id: string };
  AcquiredEventModal: { id_modal: string };
  UseEventScreen: { id: string };
  QrUseEventScreen: { id: string };
  ConsumedEventScreen: { id: string; holder?: string };

  // Chequear si son necesarios
  Rewards: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      <Stack.Screen name="CanjearScreen" component={CanjearScreen} />
      <Stack.Screen
        name="WithdrawMethodScreen"
        component={WithdrawMethodScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="SendScreen" component={SendScreen} />
      <Stack.Screen
        name="WalletHistoryScreen"
        component={WalletHistoryScreen}
      />
      <Stack.Screen name="RechargeScreen" component={RechargeScreen} />
      <Stack.Screen
        name="WalletSettingsScreen"
        component={WalletSettingsScreen}
      />
      <Stack.Screen
        name="QR"
        component={QRScannerScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="RecyclingMap"
        component={RecyclingMapScreen}
        options={{ headerShown: true, title: "Mapa de Reciclaje" }}
      />
      <Stack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserDashboardScreen"
        component={UserDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReceiveScreen"
        component={ReceiveScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PayphoneSuccess"
        component={PayphoneSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CobrarScreen"
        component={CobrarScreen}
        options={{ headerShown: false, title: "Cobrar" }}
      />
      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="UserResources"
        component={UserResourcesScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewPassword"
        component={NewPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventsManagement"
        component={EventsManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UsersManagement"
        component={UsersManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UseEventScreen"
        component={UseEventScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QrUseEventScreen"
        component={QRUseEventScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ConsumedEventScreen"
        component={ConsumedEventScreen}
        options={{ headerShown: false }}
      />
      {/* TODO REVISAR SI ES NECESARIO */}
      <Stack.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersStackNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewPaymentScreen"
        component={NewPaymentScreen}
        options={{ headerShown: false }}
      />
      {/* Modales */}
      <Stack.Screen
        name="EventModal"
        component={EventModal}
        options={{
          headerShown: false,
          gestureEnabled: true,
          presentation: "transparentModal",
          animation: "slide_from_bottom",
          animationTypeForReplace: "push",
        }}
      />
      <Stack.Screen
        name="AcquiredEventModal"
        component={AcquiredEventModal}
        options={{
          headerShown: false,
          gestureEnabled: true,
          presentation: "transparentModal",
          animation: "slide_from_bottom",
          animationTypeForReplace: "push",
        }}
      />
    </Stack.Navigator>
  );
};
