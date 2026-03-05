import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OrdersStackParamList } from "../../types";
import {
  OrdersScreen,
  OrderDetailScreen,
  DeliveryScreen,
} from "@screens/Orders";

const Stack = createNativeStackNavigator<OrdersStackParamList>();

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
