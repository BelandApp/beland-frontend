import { NavigatorScreenParams } from "@react-navigation/native";

export type DashboardStackParamList = {
  Dashboard: undefined;
  EventsManagement: undefined;
  OrdersManagement: undefined;
  OrderAdminDetail?: { orderId: string };
  UsersManagement: undefined;
  ProductsManagement: undefined;
  ExperiencesManagement: undefined;
  FinancesManagement: undefined;
};
export type GroupsStackParamList = {
  Construction: undefined;
  GroupsList: undefined;
  CreateGroup: undefined;
  GroupExplore: undefined;
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
  Catalog: { comeFromRecharge?: boolean };
  Community: undefined;
  Groups: NavigatorScreenParams<GroupsStackParamList>;
};
