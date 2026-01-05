import { NavigatorScreenParams } from "@react-navigation/native";

export type GroupsStackParamList = {
  GroupsList: undefined;
  CreateGroup: undefined;
  GroupExplore: undefined;
  GroupDetailScreen: { groupId: string };
  GroupMembersScreen: { groupId: string; groupName?: string };
  GroupOrdersHistoryScreen: { groupId: string; groupName?: string };
  GroupServicesHistoryScreen: { groupId: string; groupName?: string };
  GroupFinancialPanelScreen: { groupId: string; groupName?: string };
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: {
    orderId: string;
  };
  Delivery: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Wallet: undefined;
  Catalog: undefined;
  Community: undefined;
  Groups: NavigatorScreenParams<GroupsStackParamList>;
};
