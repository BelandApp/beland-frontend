import { createStackNavigator } from "@react-navigation/stack";
import {
  EventsManagementScreen,
  OrderAdminDetailScreen,
  OrdersManagementScreen,
  ProductsManagementScreen,
  UserDashboard,
  UsersManagementScreen,
} from "src/screens/DashboardUser";
import FinancesManagement from "src/screens/DashboardUser/FinanceManagementScreen";
import { DashboardStackParamList } from "src/types";

const Stack = createStackNavigator<DashboardStackParamList>();
export const DashboardStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={UserDashboard} />
      <Stack.Screen
        name="EventsManagement"
        component={EventsManagementScreen}
      />
      <Stack.Screen name="FinancesManagement" component={FinancesManagement} />
      <Stack.Screen
        name="OrdersManagement"
        component={OrdersManagementScreen}
      />
      <Stack.Screen
        name="OrderAdminDetail"
        component={OrderAdminDetailScreen}
      />
      <Stack.Screen
        name="ProductsManagement"
        component={ProductsManagementScreen}
      />
      <Stack.Screen name="UsersManagement" component={UsersManagementScreen} />
    </Stack.Navigator>
  );
};
