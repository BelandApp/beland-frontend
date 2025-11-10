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
  Wallet: undefined;
  Catalog: undefined;
  Community: undefined;
  Groups: GroupsStackParamList;
};
