import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Group } from "../../../../types/Group";

interface Props {
  group: Group;
  onPress?: (id: string) => void;
}

export const GroupCard: React.FC<Props> = ({ group, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(group.id)}
      style={{
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#eee",
            marginRight: 12,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "600" }}>{group.name}</Text>
          <Text style={{ color: "#666", fontSize: 12 }}>
            {group.location || ""}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default GroupCard;
