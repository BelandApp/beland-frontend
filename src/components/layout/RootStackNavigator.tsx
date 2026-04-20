import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";

// Navigators imports
import { MainTabNavigator } from "./MainTabNavigator";
import { OrdersStackNavigator } from "./OrdersStackNavigator";
// Types imports
import {
  DashboardStackParamList,
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
import { QRScannerScreen } from "@screens/QRScannerScreen";
import PaymentScreen from "@screens/Payment/PaymentScreen";
import UserResourcesScreen from "@screens/UserResources/UserResourcesScreen";
import { LoginScreen } from "@screens/Login";
import { RegisterScreen } from "@screens/Register";
import { NewPasswordScreen } from "@screens/NewPassword";
import { RewardsScreen } from "@screens/Rewards";
import {
  UseEventScreen,
  QRUseEventScreen,
  ConsumedEventScreen,
} from "@screens/UseEventScreen";
import { NewPaymentScreen, PaymentScreenRoute } from "@screens/NewPayment";
// TODO arreglar pantallas en carpeta raiz
import { Guard } from "src/guard/GuardRole";
import { WalletGuestScreen } from "src/screens/Wallet/guardScreen/WalletGuestScreen";
import TransferReceive from "src/screens/Wallet/TransferReceive";
import {
  CreateGroupScreen,
  HistoryScreen,
  RecyclingMapScreen,
} from "../../screens";
import FAQScreen from "src/screens/FAQ/FaqScreen";
import { DashboardStackNavigator } from "./DashboardNavigator";
import { GroupExploreScreen, GroupDetailScreen } from "@/screens/GroupStack";

export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  Register: undefined;
  NewPassword: undefined;
  // Main Screens
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  UserDashboardScreen: NavigatorScreenParams<DashboardStackParamList>;
  // FAQ
  FAQ: undefined;
  // Payments
  CobrarScreen: undefined;
  SendScreen: { id?: string; amount?: string };
  ReceiveScreen: undefined;
  HistoryScreen: undefined;
  WalletHistoryScreen: undefined;
  RechargeScreen: { paramsAmount?: string } | undefined;
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
  UserResources: undefined;
  CommerceDashboard: undefined;
  QR: { pendingRedemption?: any } | undefined;
  RecyclingMap: undefined;
  CanjearScreen: undefined;
  WithdrawMethodScreen: {
    beCoinsAmount: number;
    usdAmount: number;
  };

  MisEntradas: { tab: string | undefined };
  // Events Screens
  EventModal: { id: string };
  AcquiredEventModal: { id_modal: string };
  UseEventScreen: { id: string };
  QrUseEventScreen: { id: string };
  ConsumedEventScreen: { id: string; holder?: string };
  // Transfers
  TransferReceive: { id: string };
  // Groups fuera del StackGroups para evitar TabBar
  GroupCreate: undefined;
  GroupExplore: undefined;
  GroupDetail: { groupId: string; groupName?: string };
  // Chequear si son necesarios
  Rewards: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="Orders"
        component={OrdersStackNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="CanjearScreen" component={CanjearScreen} />

      <Stack.Screen name="SendScreen">
        {(props) => (
          <Guard
            intent={{
              screen: "SendScreen",
              id: props.route.params.id,
              amount: props.route.params.amount,
            }}
            fallback={<WalletGuestScreen />}
          >
            <SendScreen {...props} />
          </Guard>
        )}
      </Stack.Screen>
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserDashboardScreen"
        component={DashboardStackNavigator}
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
      <Stack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransferReceive"
        options={{ headerShown: false }}
        component={TransferReceive}
      />
      <Stack.Screen name="GroupCreate" component={CreateGroupScreen} />
      <Stack.Screen name="GroupExplore" component={GroupExploreScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
    </Stack.Navigator>
  );
};
