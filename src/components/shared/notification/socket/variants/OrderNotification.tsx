import { View, Text } from "react-native";
import { TypeNotification } from "../NotificationCard";

export const OrderNotification: React.FC<TypeNotification> = ({ meta }) => {
  if (!meta) return null;
  return (
    <View className="flex flex-col">
      <Text className="text-lg">#{meta.short_id ?? meta.order_id}</Text>
      <Text>
        {meta.items_count} producto
        {meta.items_count !== 1 ? "s" : ""}
      </Text>
      <View className="flex flex-row items-center">
        <Text>Total USD</Text>
        <Text>${meta.total_usd?.toFixed(2)}</Text>
      </View>

      <View className="flex flex-row items-center">
        <Text>Total Becoins</Text>
        <Text>{meta.total_becoin} BC</Text>
      </View>
    </View>
  );
};
