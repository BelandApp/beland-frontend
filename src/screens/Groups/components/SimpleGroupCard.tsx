import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "../../../components/ui/Card";
import { GroupIcon } from "../../../components/icons";
import { colors } from "../../../styles/colors";
import { Group } from "../../../types/Group";
import { groupCardStyles, buttonStyles } from "../styles";
import { useGroupsUtils } from "../hooks";

interface SimpleGroupCardProps {
  group: Group;
  onPress: (groupId: string) => void;
}

export const SimpleGroupCard: React.FC<SimpleGroupCardProps> = ({
  group,
  onPress,
}) => {
  const { getStatusColor, getStatusText } = useGroupsUtils();

  return (
    <TouchableOpacity
      key={group.id}
      style={groupCardStyles.groupCard}
      activeOpacity={0.8}
      onPress={() => onPress(group.id)}
    >
      <Card style={groupCardStyles.cardContent}>
        <View style={groupCardStyles.groupHeader}>
          <View style={groupCardStyles.groupTitleContainer}>
            <GroupIcon width={20} height={20} color={colors.belandOrange} />
            <Text style={groupCardStyles.groupName}>{group.name}</Text>
          </View>
          <View style={groupCardStyles.badgeContainer}>
            <View
              style={[
                groupCardStyles.statusBadge,
                { backgroundColor: getStatusColor(group.status) },
              ]}
            >
              <Text style={groupCardStyles.statusText}>
                {getStatusText(group.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={groupCardStyles.groupInfo}>
          {group.location && (
            <Text style={groupCardStyles.location}>📍 {group.location}</Text>
          )}
          {group.date_time && (
            <Text style={groupCardStyles.deliveryTime}>
              📅 {new Date(group.date_time).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={groupCardStyles.amountInfo}>
          <Text style={groupCardStyles.amountLabel}>
            Creado: {new Date(group.created_at).toLocaleDateString()}
          </Text>
          {group.updated_at && (
            <Text style={groupCardStyles.myAmountLabel}>
              Actualizado: {new Date(group.updated_at).toLocaleDateString()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[buttonStyles.manageButton, { marginTop: 12 }]}
          onPress={() => onPress(group.id)}
        >
          <Text style={buttonStyles.manageButtonText}>Ver detalles</Text>
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );
};
