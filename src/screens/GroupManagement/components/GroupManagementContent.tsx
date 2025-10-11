import React from "react";
import { Group } from "../../../types/Group";
import { TabType } from "../types";
import { SimpleGroupContentManager } from "./SimpleGroupContentManager";
import { SimplePaymentModeManager } from "./SimplePaymentModeManager";

interface GroupManagementContentProps {
  currentGroup: Group;
  activeTab: TabType;
  isGroupAdmin: boolean;
  onGroupUpdated: (updatedGroup: Group) => void;
  navigation?: any;
}

export const GroupManagementContent: React.FC<GroupManagementContentProps> = ({
  currentGroup,
  activeTab,
  isGroupAdmin,
  onGroupUpdated,
  navigation,
}) => {
  switch (activeTab) {
    case "content":
      return (
        <SimpleGroupContentManager
          group={currentGroup}
          onGroupUpdated={onGroupUpdated}
          isReadOnly={!isGroupAdmin}
          navigation={navigation}
        />
      );
    case "payment":
      return (
        <SimplePaymentModeManager
          group={currentGroup}
          onGroupUpdated={onGroupUpdated}
          isReadOnly={!isGroupAdmin}
        />
      );
    default:
      return null;
  }
};
