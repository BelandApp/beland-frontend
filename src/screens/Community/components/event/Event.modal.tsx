import React, { useMemo, useState } from "react";
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
import {
  ArrowLeftRight,
  Calendar,
  MapPin,
  SquareChevronDown,
  Ticket,
  X,
} from "lucide-react-native";
import { useEventStore } from "src/stores/Event";
import { colors } from "src/styles";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "src/context";

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
export const EventModal = ({ route }: { route: any }) => {
  const { id } = route.params;
  const { getEvent } = useEventStore();
  const event = getEvent(id);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [visibleImage, setVisibleImage] = useState(0);
  const { canPerformAction } = useAuth();
  if (!event) return null;
  const {
    description,
    discount,
    end_sale_date,
    event_date,
    image_url,
    images_urls,
    is_active,
    is_refundable,
    limit_tickets,
    name,
    price_becoin,
    refund_days_limit,
    start_sale_date,
    total_becoin,
    event_city,
    sold_tickets,
    event_place,
  } = event;

  const handleClose = () => {
    navigation.goBack();
  };
  const allImages = useMemo(() => {
    if (!images_urls || images_urls.length === 0) return [image_url];
    return [image_url, ...images_urls];
  }, [image_url, images_urls]);

  const handleImages = () => {
    setVisibleImage((prev) => (prev + 1) % allImages.length);
  };

  const handleBuy = () => {
    if (!canPerformAction) {
      alert("Debes iniciar sesión para comprar");
      return;
    }
    navigation.navigate("PaymentScreen", {
      paymentData: {
        amount: Number(price_becoin),
        wallet_id: "",
      },
      amount_to_payment_id: id,
    });
  };
  return (
    <View style={styles.modal}>
      <View style={styles.modalContainer}>
        <Pressable style={styles.closeButton} onPress={() => handleClose()}>
          <SquareChevronDown />
        </Pressable>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.textName}>{name}</Text>
            <View style={styles.imageContainer}>
              {allImages.length > 1 && (
                <Pressable
                  style={styles.arrowButton}
                  onPress={() => handleImages()}
                >
                  <ArrowLeftRight />
                </Pressable>
              )}
              {allImages.map((img, index) => {
                const isVisible = index === visibleImage;
                return (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    style={[
                      styles.image,
                      isVisible
                        ? { zIndex: 2 }
                        : {
                            position: "absolute",
                            bottom: index * -2,
                            right: Platform.OS === "web" ? index * -50 : 10,
                            left: Platform.OS === "web" ? 0 : 10,
                            opacity: 0.9,
                            zIndex: 1,
                          },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.descriptionContainer}>
              <View style={styles.headerDescription}>
                <View style={styles.textContainer}>
                  <MapPin />
                  <Text style={styles.eventText}>
                    {event_place},{event_city}
                  </Text>
                </View>
                <View style={styles.textContainer}>
                  <Calendar />
                  <Text style={styles.eventText}>
                    {event_date
                      ? new Date(event_date).toLocaleDateString()
                      : ""}
                  </Text>
                </View>
              </View>
              <Text>{description}</Text>
              <View style={styles.textContainer}>
                <Ticket />
                <Text>{limit_tickets - sold_tickets} restantes</Text>
              </View>
            </View>
            <Pressable style={styles.buyButton} onPress={handleBuy}>
              <Text style={styles.buyButtonText}>Adquirir</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 1,
  },
  modalContainer: {
    width: "100%",
    height: "98%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "white",
    position: "relative",
    justifyContent: "space-between",
    boxShadow: "0px -2px 4px rgba(55, 48, 48, 0.27)",
  },
  contentContainer: {
    width: Platform.OS === "web" ? "70%" : "100%",
    flexDirection: "column",
    gap: 20,
    paddingTop: 40,
    marginHorizontal: "auto",
    justifyContent: "space-between",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  textName: {
    fontSize: Platform.OS === "web" ? 40 : 34,
    fontWeight: "bold",
    color: colors.belandOrange,
    alignSelf: "center",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    maxWidth: Platform.OS === "web" ? 500 : 350,
    height: Platform.OS === "web" ? 250 : 200,
    borderRadius: 20,
    resizeMode: "cover",
    marginHorizontal: "auto",
  },
  otherImages: {
    position: "absolute",
    bottom: -5,
    right: Platform.OS === "web" ? -25 : 10,
    left: Platform.OS === "web" ? 0 : 10,
    opacity: 0.9,
    zIndex: 1,
  },
  arrowButton: {
    position: "absolute",
    top: "45%",
    right: -15,
    zIndex: 3,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 50,
  },
  descriptionContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    gap: 10,
    paddingTop: 10,
  },
  headerDescription: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eventText: {
    fontSize: 18,
    fontWeight: "600",
  },
  buyButton: {
    backgroundColor: colors.belandOrange,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    maxWidth: 300,
    marginHorizontal: "auto",
    boxShadow:
      "0px 4px 6px rgba(0, 0, 0, 0.3), 0px 0px 2px rgba(0, 0, 0, 0.15)",
  },
  buyButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
