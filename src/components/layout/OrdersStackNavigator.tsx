import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {OrdersStackParamList} from "../../types";
import {
  OrdersScreen,
  OrderDetailScreen,
  DeliveryScreen,
} from "@screens/Orders";

const Stack = createStackNavigator<OrdersStackParamList>();

export const OrdersStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OrdersList" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Delivery" component={DeliveryScreen} />
    </Stack.Navigator>
  );
};
