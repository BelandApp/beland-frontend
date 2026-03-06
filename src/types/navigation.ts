import { NavigatorScreenParams } from "@react-navigation/native";

export type DashboardStackParamList = {
  Dashboard: undefined;
  EventsManagement: undefined;
  OrdersManagement: undefined;
  OrderAdminDetail?: { orderId: string };
  UsersManagement: undefined;
  ProductsManagement: undefined;
  FinancesManagement: undefined;
};
export type GroupsStackParamList = {
  GroupsList: undefined;
  GroupMembers: { groupId: string; groupName?: string };
  GroupOrdersHistory: { groupId: string; groupName?: string };
  GroupServicesHistory: { groupId: string; groupName?: string };
  GroupFinancialPanel: { groupId: string; groupName?: string };
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
