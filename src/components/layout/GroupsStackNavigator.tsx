import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { GroupsStackParamList } from "@/types/navigation";
import { GroupsScreen } from "@/screens";
import GroupExploreScreen from "@/screens/Groups/GroupExploreScreen";
import { GroupDetailScreen } from "@/screens/GroupDetailScreen";
import GroupMembersScreen from "src/screens/Groups/GroupMembersScreen";

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
      <Stack.Screen name="GroupDetailScreen" component={GroupDetailScreen} />
      <Stack.Screen name="GroupMembersScreen" component={GroupMembersScreen} />
    </Stack.Navigator>
  );
};
