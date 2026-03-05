import React from "react";
import { GroupsStackParamList } from "@/types/navigation";
import { GroupsScreen } from "@/screens";
import GroupExploreScreen from "@/screens/Groups/GroupExploreScreen";
import { GroupDetailScreen } from "@/screens/GroupDetailScreen";
import GroupMembersScreen from "src/screens/Groups/GroupMembersScreen";
import {
  GroupFinancialPanelScreen,
  GroupOrdersHistoryScreen,
  GroupServicesHistoryScreen,
} from "src/screens/Groups";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ConstructionScreen from "src/screens/Construction/Construction.screen";
import ConstructionGroups from "src/screens/Groups/ConstructionGroups";
const Stack = createNativeStackNavigator<GroupsStackParamList>();

export const GroupsStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Construction"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Construction" component={ConstructionGroups} />
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      <Stack.Screen name="GroupExplore" component={GroupExploreScreen} />
      <Stack.Screen name="GroupMembersScreen" component={GroupMembersScreen} />
      <Stack.Screen
        name="GroupOrdersHistoryScreen"
        component={GroupOrdersHistoryScreen}
      />
      <Stack.Screen
        name="GroupServicesHistoryScreen"
        component={GroupServicesHistoryScreen}
      />
      <Stack.Screen
        name="GroupFinancialPanelScreen"
        component={GroupFinancialPanelScreen}
      />
    </Stack.Navigator>
  );
};
