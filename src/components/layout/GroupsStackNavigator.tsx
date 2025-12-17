import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { GroupsStackParamList } from "@/types/navigation";
import {
  GroupsScreen,
  CreateGroupScreen,
  GroupManagementScreen,
} from "@/screens";

const Stack = createStackNavigator<GroupsStackParamList>();

export const GroupsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      {/* CreateGroup is presented at root level to hide the main tab bar */}
      <Stack.Screen name="GroupManagement" component={GroupManagementScreen} />
    </Stack.Navigator>
  );
};
