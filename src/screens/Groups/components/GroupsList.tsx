import React from "react";
import { View } from "react-native";
import { Group } from "@/types/Group";
import { SimpleGroupCard } from "./SimpleGroupCard";
import { EmptyState } from "./EmptyState";
import { groupCardStyles } from "../styles";

interface GroupsListProps {
  groups: Group[];
  onGroupPress: (groupId: string) => void;
  emptyStateType: "Activos" | "Historial";
}

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  onGroupPress,
  emptyStateType,
}) => {
  if (groups.length === 0) {
    return <EmptyState type={emptyStateType} />;
  }

  return (
    <View style={groupCardStyles.groupsList}>
      {groups.map((group) => (
        <SimpleGroupCard key={group.id} group={group} onPress={onGroupPress} />
      ))}
    </View>
  );
};
