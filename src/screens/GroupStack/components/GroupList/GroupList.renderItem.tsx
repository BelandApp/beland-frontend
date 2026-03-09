import { View, Text, Pressable, ListRenderItem, Image } from "react-native";
import React, { useCallback } from "react";
import { Group } from "src/services";
import { Timer, Users } from "lucide-react-native";
import { formatDateTime } from "../../helper/dateTransform";
import { useCustomNavigation } from "src/hooks";
type Props = {
  item: Group;
};
const GroupListItem = React.memo(({ item }: Props) => {
  const { navigate } = useCustomNavigation();

  const handlePress = useCallback(() => {
    navigate("GroupDetail", { groupId: item.id, groupName: item.name });
  }, [navigate, item.id]);
  return (
    <Pressable
      onPress={handlePress}
      className="m-2 flex-row gap-1 rounded-2xl shadow-lg elevation bg-background-light min-h-28"
    >
      <View>
        <Image
          source={{ uri: item.image_url ?? item.group_type.image_url }}
          className="w-24 h-full object-contain rounded-l-2xl"
        />
      </View>
      {/* Divider */}
      <View id="divider" className="h-full border-l-green-300 border-l-2" />
      <View className="flex-grow py-2 justify-between pb-2">
        <View className="flex-row items-center justify-between">
          {/* Icono */}
          <View className="flex-row gap-1">
            <Users />
            {/* name */}
            <Text className="capitalize text-lg font-semibold">
              {item.name}
            </Text>
          </View>
        </View>

        {/* description */}
        <Text className="capitalize text-gray-600">{item.description}</Text>
        {/* createdBy */}
        <Text className="capitalize text-gray-600">
          Creador: {item.user_id}
        </Text>
        {/* Event Date */}
        {new Date(item.event_at) > new Date() ? (
          <View className="flex-row gap-1 items-center">
            <Timer color="green" />
            <Text>{formatDateTime(item.event_at)} hs.</Text>
          </View>
        ) : (
          <View className="flex-row gap-1 items-center">
            <Timer color="red" />
            <Text>Evento finalizado</Text>
          </View>
        )}
      </View>
      <View className="justify-between pb-2">
        {/* badge */}
        <Text className="px-4 py-2 self-end bg-orange-500 text-white rounded-bl-2xl rounded-tr-2xl h-fit">
          {item.privacy.name}
        </Text>
        <View className="flex-row items-center gap-[-4px]">
          {/* {item.members.map((member)=>{
          <View className="flex-row items-center gap-[-4px]" accessibilityLabel={`Imagen de ${member.name}`}>
          <Image
            className="w-8 h-8 rounded-full shadow"
            source={{ uri: member.image_url }}
          />
          </View>
          })} */}
          <Image
            className="w-8 h-8 rounded-full shadow"
            source={{ uri: item.image_url }}
          />
        </View>
      </View>
    </Pressable>
  );
});

export default GroupListItem;
