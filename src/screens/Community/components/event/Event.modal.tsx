import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Heart, X } from "lucide-react-native";
import { useEventStore } from "src/stores/Event";
import { colors } from "src/styles";

type EventModalProps = {
  visible: boolean;
  onClose: () => void;
  onLike: () => void;
  liked: boolean;
  imageUrl: string;
  code: string;
  instructions: string[];
};

export const EventModal = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { id } = route.params;
  const { events, setEvent } = useEventStore();
  const event = events[id];
  if (!event) return null;
  const {
    background_url,
    code,
    description,
    discount,
    end_date,
    event_date,
    image_url,
    is_active,
    is_refundable,
    limit_tickets,
    name,
    price_becoins,
    refund_days_limit,
    start_date,
    total_becoin,
    is_user_favorite,
  } = event;

  const handleClose = () => {
    navigation.goBack();
  };

  const handleFavorite = (e: any) => {
    setEvent({ ...events[id], id, is_user_favorite: !is_user_favorite });
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.modalContainer}>
        {/* Imagen superior */}
        <Image source={{ uri: background_url }} style={styles.banner} />

        {/* Botón Cerrar */}
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <X color="#fff" size={20} />
        </Pressable>

        {/* Botón Like */}
        <Pressable style={styles.likeButton} onPress={handleFavorite}>
          {is_user_favorite ? (
            <Heart color="red" fill="red" />
          ) : (
            <Heart color="white" />
          )}
        </Pressable>

        {/* Contenido inferior */}
        <View style={styles.content}>
          <Text>Con el siguiente codigo podras acceder:</Text>
          <View style={styles.codeSection}>
            {/* Aquí podrías poner el QR real usando react-native-qrcode-svg */}
            <View style={styles.fakeQR} />
            <View style={styles.codeSection}>
              {code.split("").map((char, index) => (
                <Text style={styles.codeText} key={index}>
                  {char}
                </Text>
              ))}
            </View>
          </View>

          <ScrollView style={{ maxHeight: 180, marginTop: 10 }}>
            <Text style={styles.instruction}>{description}</Text>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    marginHorizontal: "auto",
    height: "95%",
    marginTop: "auto",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  banner: {
    width: "100%",
    height: Platform.OS === "web" ? 200 : 140,
    backgroundColor: colors.belandGreenLight,
    resizeMode: "stretch",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
    backgroundColor: "#0006",
    borderRadius: 20,
  },
  likeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 6,
    backgroundColor: "#0006",
    borderRadius: 20,
  },
  content: {
    padding: 16,
  },
  codeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  fakeQR: {
    width: 80,
    height: 80,
    backgroundColor: "#000",
  },
  codeText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "monospace",
    borderStyle: "solid",
    borderWidth: 1,
    padding: 10,
  },
  instruction: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
});
