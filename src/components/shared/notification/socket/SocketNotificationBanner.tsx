export type NotificationType = "order" | "finance" | "event" | "generic";

export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  persistent?: boolean;
  visible: boolean;
  meta?: any;
}

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { useNotification } from "src/hooks/NotificationContext";
import { NotificationCard } from "./NotificationCard";

export const NotificationBanner = () => {
  const { notification } = useNotification();
  const translateY = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (!notification) return;

    Animated.spring(translateY, {
      toValue: notification.visible ? 0 : -180,
      useNativeDriver: true,
    }).start();
  }, [notification?.visible]);

  if (!notification) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <NotificationCard notification={notification} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 24,
    right: 16,
    zIndex: 999,
  },
});
