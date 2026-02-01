import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigatorScreenParams } from "@react-navigation/native";

// Navigators imports
import { MainTabNavigator } from "./MainTabNavigator";
import { OrdersStackNavigator } from "./OrdersStackNavigator";
// Types imports
import {
  GroupsStackParamList,
  MainTabParamList,
  OrdersStackParamList,
} from "src/types/navigation";
// Screens imports
import {
  CanjearScreen,
  ReceiveScreen,
  CobrarScreen,
  SendScreen,
  WalletHistoryScreen,
  RechargeScreen,
  WalletSettingsScreen,
  PayphoneSuccessScreen,
} from "@screens/Wallet";
import { CreateGroupScreen } from "@screens/Groups/CreateGroupScreen";
import { QRScannerScreen } from "@screens/QRScannerScreen";
import PaymentScreen from "@screens/Payment/PaymentScreen";
import UserDashboardScreen from "@screens/UserDashboardScreen";
import UserResourcesScreen from "@screens/UserResources/UserResourcesScreen";
import { LoginScreen } from "@screens/Login";
import { RegisterScreen } from "@screens/Register";
import { NewPasswordScreen } from "@screens/NewPassword";
import { RewardsScreen } from "@screens/Rewards";
import { EventModal, AcquiredEventModal } from "@screens/Events";
import {
  UseEventScreen,
  QRUseEventScreen,
  ConsumedEventScreen,
} from "@screens/UseEventScreen";
import { NewPaymentScreen, PaymentScreenRoute } from "@screens/NewPayment";
import {
  EventsManagementScreen,
  UsersManagementScreen,
  OrdersManagementScreen,
  OrderAdminDetailScreen,
  ProductsManagementScreen,
} from "@screens/DashboardUser";
// TODO arreglar pantallas en carpeta raiz
import { HistoryScreen, RecyclingMapScreen } from "../../screens";
import FinancesManagement from "src/screens/DashboardUser/FinanceManagementScreen";
import { GroupsStackNavigator } from "./GroupsStackNavigator";

export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  Register: undefined;
  NewPassword: undefined;
  // Main Screens
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  Groups: NavigatorScreenParams<GroupsStackParamList>;
  CreateGroup: undefined;
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
  OrdersManagement: undefined;
  OrderAdminDetail?: { orderId: string };
  UsersManagement: undefined;
  ProductsManagement: undefined;
  FinancesManagement: undefined;
  MisEntradas: { tab: string | undefined };
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
      <Stack.Screen name="Groups" component={GroupsStackNavigator} />
      <Stack.Screen
        name="Orders"
        component={OrdersStackNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="CanjearScreen" component={CanjearScreen} />

      <Stack.Screen name="SendScreen" component={SendScreen} />
      <Stack.Screen
        name="WalletHistoryScreen"
        component={WalletHistoryScreen}
      />
      <Stack.Screen name="RechargeScreen" component={RechargeScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
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
        options={{ headerShown: false }}
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
        name="MisEntradas"
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
        name="OrdersManagement"
        component={OrdersManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderAdminDetail"
        component={OrderAdminDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UsersManagement"
        component={UsersManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductsManagement"
        component={ProductsManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FinancesManagement"
        component={FinancesManagement}
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

      <Stack.Screen
        name="Rewards"
        component={RewardsScreen}
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
          animationTypeForReplace: "pop",
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
