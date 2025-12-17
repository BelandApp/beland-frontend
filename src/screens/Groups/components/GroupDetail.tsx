import React from "react";
import { View, Text, ScrollView, Button } from "react-native";
import { Group } from "../../../../types/Group";

interface Props {
  group: Group | null;
}

export const GroupDetail: React.FC<Props> = ({ group }) => {
  if (!group)
    return (
      <View>
        <Text>Grupo no encontrado</Text>
      </View>
    );
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{group.name}</Text>
      <Text style={{ color: "#666", marginTop: 8 }}>
        {group.location || ""}
      </Text>
      <View style={{ marginTop: 16 }}>
        <Button title="Gestionar miembros" onPress={() => {}} />
      </View>
    </ScrollView>
  );
};

export default GroupDetail;
