import { Heart } from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  Platform,
} from "react-native";
import { Card } from "src/components/ui";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
export type EventCardProps = {
  id: string;
  name: string;
  image_url: string;
  background_url: string;
  code: string;
  description: string;
  event_date: Date;
  start_date: Date;
  end_date: Date;
  limit_tickets: number;
  price_becoins: number;
  discount: number;
  total_becoin: number;
  is_active: boolean;
  is_refundable: boolean;
  refund_days_limit: number | null;
  is_user_favorite: boolean;
};
import { StackNavigationProp } from "@react-navigation/stack";
import { useEventStore } from "src/stores/Event";

type EventScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EventModal"
>;
export const EventCard: React.FC<EventCardProps> = ({
  id,
  name,
  image_url,
  discount,
  is_user_favorite,
}) => {
  const navigation = useNavigation<EventScreenNavigationProp>();
  const { events, setEvent } = useEventStore();
  const handleFavorite = (e: any) => {
    e.stopPropagation();
    setEvent({ ...events[id], id, is_user_favorite: !is_user_favorite });
  };
  return (
    <Pressable onPress={() => navigation.navigate("EventModal", { id: id })}>
      <Card
        style={{
          paddingHorizontal: 24,
          paddingVertical: 18,
          alignItems: "center",
          position: "relative",
          gap: 5,
        }}
      >
        {/* Botón favorito */}
        <Pressable
          onPress={handleFavorite}
          style={{
            position: "absolute",
            top: 5,
            right: 10,
            zIndex: 10,
          }}
        >
          <Heart color={"red"} fill={is_user_favorite ? "red" : "none"} />
        </Pressable>

        <Image style={{ width: 90, height: 64 }} source={{ uri: image_url }} />

        <View style={{ flexDirection: "column", gap: 5, alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            {discount} off
          </Text>
          <Text style={{ color: "#235faeff" }}>{name}</Text>
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
});
