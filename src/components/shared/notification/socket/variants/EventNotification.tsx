import { View, Text } from "react-native";
import { TypeNotification } from "../NotificationCard";

export const EventNotification: React.FC<TypeNotification> = ({ meta }) => {
  if (!meta) return null;
  return (
    <View className="flex flex-col">
      <Text className="text-lg">{meta.name || meta.code || meta.message}</Text>

      <View className="flex flex-row items-center">
        <Text>Asistencias:</Text>
        <Text className="">{meta.attended_count ?? "No disponible"}</Text>
      </View>

      <View className="flex flex-row items-center">
        <Text> Vendidas:</Text>
        <Text>{meta.sold_tickets ?? "No disponible"}</Text>
      </View>
    </View>
  );
};
