import React from "react";
import { GroupsStackParamList } from "@/types/navigation";
import GroupMembersScreen from "src/screens/Groups/GroupMembersScreen";
import {
  GroupFinancialPanelScreen,
  GroupOrdersHistoryScreen,
  GroupServicesHistoryScreen,
} from "src/screens/Groups";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupScreen from "src/screens/GroupStack/Group.screen";
const Stack = createNativeStackNavigator<GroupsStackParamList>();

export const GroupsStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="GroupsList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GroupsList" component={GroupScreen} />

      <Stack.Screen name="GroupMembers" component={GroupMembersScreen} />
      <Stack.Screen
        name="GroupOrdersHistory"
        component={GroupOrdersHistoryScreen}
      />
      <Stack.Screen
        name="GroupServicesHistory"
        component={GroupServicesHistoryScreen}
      />
      <Stack.Screen
        name="GroupFinancialPanel"
        component={GroupFinancialPanelScreen}
      />
    </Stack.Navigator>
  );
};
