import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { GroupsStackParamList } from "@/types/navigation";
import { GroupsScreen } from "@/screens";
import GroupExploreScreen from "@/screens/Groups/GroupExploreScreen";

const Stack = createStackNavigator<GroupsStackParamList>();

export const GroupsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      <Stack.Screen name="GroupExplore" component={GroupExploreScreen} />
    </Stack.Navigator>
  );
};
