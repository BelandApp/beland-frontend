import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { containerStyles, buttonStyles } from "../styles";
import { UserMenu } from "../../../components/ui/UserMenu";

interface GroupsHeaderProps {
  onCreateGroup: () => void;
}

export const GroupsHeader: React.FC<GroupsHeaderProps> = ({
  onCreateGroup,
}) => {
  return (
    <View style={containerStyles.titleContainer}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          width: "100%",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={containerStyles.sectionTitle}>Mis Grupos</Text>
        </View>
      <TouchableOpacity
        style={buttonStyles.createButton}
        activeOpacity={0.8}
        onPress={onCreateGroup}
      >
        <Text style={buttonStyles.createButtonText}>+ Grupo</Text>
      </TouchableOpacity>
        <UserMenu />
      </View>

    </View>
  );
};
