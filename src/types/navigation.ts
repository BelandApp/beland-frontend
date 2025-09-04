export type GroupsStackParamList = {
  GroupsList: undefined;
  CreateGroup: undefined;
  GroupManagement: {
    groupId: string;
  };
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
  QRScanner: undefined;
  Groups: undefined;
  Wallet: undefined;
  Community: undefined;
  History: undefined;
  Profile: undefined;
};
