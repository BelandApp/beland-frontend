import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  NotificationData,
  useNotification,
} from "src/hooks/NotificationContext";
import { OrderNotification } from "./variants/OrderNotification";
import { FinanceNotification } from "./variants/FinanceNotification";
import { useCustomNavigation } from "src/hooks";
import { Button } from "../../buttons";
import { EventNotification } from "./variants/EventNotification";
type NotificationTypeProps = {
  notification: NotificationData;
};
export type TypeNotification = {
  meta: Record<string, any> | undefined | null;
};
export const NotificationCard: React.FC<NotificationTypeProps> = ({
  notification,
}) => {
  const { navigate } = useCustomNavigation();
  const { hideNotification } = useNotification();

  const handleNavigate = () => {
    switch (notification.type) {
      case "order":
        navigate("OrdersManagement");
        break;
      case "finance":
        navigate("FinancesManagement");
        break;
      default:
        break;
    }
    hideNotification();
  };

  return (
    <View className="flex flex-col border-2 border-green-500 rounded-lg bg-white p-2">
      <Text className="text-lg font-semibold">{notification.title}</Text>

      {notification.type === "order" && (
        <OrderNotification meta={notification.meta} />
      )}

      {notification.type === "finance" && (
        <FinanceNotification meta={notification.meta} />
      )}
      {notification.type === "event" && (
        <EventNotification meta={notification.meta} />
      )}

      {!notification.meta && (
        <Text className="text-gray-500">{notification.message}</Text>
      )}

      <View className="flex flex-row justify-between gap-2 border-t pt-2 border-gray-200">
        {notification.persistent && (
          <Button
            title="Cerrar"
            onPress={hideNotification}
            variant="secondary"
          />
        )}

        {notification.type !== "generic" && (
          <Button
            title="Ver detalle"
            onPress={() => {
              handleNavigate();
              hideNotification();
            }}
          />
        )}
      </View>
    </View>
  );
};
