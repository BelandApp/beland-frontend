import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import {
  ArrowLeftRight,
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  RotateCcw,
  SquareChevronDown,
  CheckCircle2,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEventStore } from "src/stores/Event";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { colors } from "src/styles";
import { useAuth } from "src/context";
import { useCustomAlert } from "src/hooks";
import { convertBeCoinsToUSD } from "src/constants";
import { CustomAlert } from "src/components/ui";

export const EventModal = ({ route }: { route: any }) => {
  const { id } = route.params;
  const { getEvent } = useEventStore();
  const event = getEvent(id);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { showCustomAlert, alertConfig, showAlert, hideAlert } =
    useCustomAlert();
  const { canPerformAction } = useAuth();
  const [visibleImage, setVisibleImage] = useState(0);

  if (!event) return null;

  const {
    name,
    description,
    event_place,
    event_city,
    event_date,
    end_sale_date,
    limit_tickets,
    sold_tickets,
    price_becoin,
    is_refundable,
    refund_days_limit,
    image_url,
    images_urls,
    user_acquired,
    user_attended,
  } = event;

  const allImages = useMemo(() => {
    if (!images_urls || images_urls.length === 0)
      return [
        "https://imgs.search.brave.com/rvuSZtq9O2zbSiueU6yoc2QNSmkTyLd0jyXB0sCzInQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTAy/MzE1MTY2MC9waG90/by9mcmllbmRzLWRh/bmNpbmctYW1vbmct/Y29uZmV0dGktYXQt/dGhlLW11c2ljLWZl/c3RpdmFsLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1Wa1A5/clJuYjRNV2t2VWV6/QXYwQldJX28zOHFa/RnA4NHZvbzJqank5/OXJVPQ",
        image_url,
      ];
    return [image_url, ...images_urls];
  }, [image_url, images_urls]);

  const fadeAnim = useSharedValue(1);
  const translateAnim = useSharedValue(0);
  const handleNextImage = () => {
    fadeAnim.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(1, { duration: 250 })
    );

    translateAnim.value = withSequence(
      withTiming(-20, { duration: 200 }),
      withTiming(0, { duration: 250 })
    );
    setVisibleImage((prev) => (prev + 1) % allImages.length);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [
      {
        translateX: interpolate(
          translateAnim.value,
          [-20, 0],
          [-20, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const handleClose = () => navigation.goBack();

  const handleBuy = async () => {
    if (!canPerformAction) {
      showCustomAlert(
        "Inicia sesión",
        "Debes iniciar sesión para comprar",
        "error"
      );
      return;
    }
    navigation.navigate("NewPaymentScreen", {
      company: {
        id: name,
        name: name,
        img: image_url,
      },
      product: {
        id: id,
        name: name,
        quantity: 1,
        price: Number(price_becoin),
        condition:"Llevar elementos reciclables al evento"
      },
      // TODO onSuccessEndpoint a mis eventos adquiridos
      onSuccessEndpoint: "",
      total_amount: Number(price_becoin),
      canBuyForOthers: true,
    });
  };

  const handleUse = async () => {
    showCustomAlert("Usando entrada", "Redirigiendo...", "info");
    navigation.navigate("UseEventScreen", { eventId: id });
  };

  const handleRefund = async () => {
    showCustomAlert("Procesando reembolso...", "", "info");
    //TODO lógica del refund acá
  };

  const eventStatus = (() => {
    if (user_attended) return { label: "Usado", color: colors.success };
    if (user_acquired)
      return { label: "Adquirido", color: colors.belandOrange };
    if (end_sale_date && new Date(end_sale_date) < new Date())
      return { label: "Finalizado", color: colors.textSecondary };
    return { label: "Disponible", color: colors.primary };
  })();

  const ticketsLeft = limit_tickets - sold_tickets;

  return (
    <View style={styles.modal}>
      <View style={styles.container}>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <SquareChevronDown color={colors.textSecondary} />
        </Pressable>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ marginHorizontal: "auto", paddingTop: 20 }}>
            {/* Imagen principal */}
            <View style={styles.imageContainer}>
              <Animated.Image
                source={{ uri: allImages[visibleImage] }}
                style={[styles.image, animatedStyle]}
              />
              {allImages.length > 1 && (
                <Pressable
                  style={styles.nextImageButton}
                  onPress={handleNextImage}
                >
                  <ArrowLeftRight color="white" size={20} />
                </Pressable>
              )}
              {/* Badge de estado */}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: eventStatus.color },
                ]}
              >
                <Text style={styles.statusText}>{eventStatus.label}</Text>
              </View>
            </View>

            <View style={styles.content}>
              {/* Nombre */}
              <Text style={styles.name}>{name}</Text>

              {/* Datos básicos */}
              <View style={styles.infoRow}>
                <Calendar size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {event_date
                    ? new Date(event_date).toLocaleDateString()
                    : "Fecha por confirmar"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {event_place}, {event_city}
                </Text>
              </View>

              {/* Descripción */}
              <Text style={styles.description}>{description}</Text>

              {/* Precio y disponibilidad */}
              <View style={styles.section}>
                <View style={styles.infoRow}>
                  <DollarSign size={18} color={colors.primary} />
                  <Text style={styles.infoStrong}>{price_becoin} Becoins</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ticket size={18} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    {ticketsLeft} tickets disponibles
                  </Text>
                </View>
              </View>

              {/* Reembolso */}
              {is_refundable && (
                <View style={[styles.refundBox]}>
                  <RotateCcw color={colors.primary} size={18} />
                  <Text style={styles.refundText}>
                    Reembolsable hasta {refund_days_limit} días antes del
                    evento.
                  </Text>
                </View>
              )}

              {/* Botones */}
              <View style={styles.actions}>
                {!user_acquired && !user_attended && (
                  <Pressable
                    style={[styles.button, styles.buyButton]}
                    onPress={handleBuy}
                  >
                    <Text style={styles.buttonText}>Adquirir</Text>
                  </Pressable>
                )}

                {user_acquired && !user_attended && (
                  <>
                    <Pressable
                      style={[styles.button, styles.useButton]}
                      onPress={handleUse}
                    >
                      <CheckCircle2 color="white" size={18} />
                      <Text style={styles.buttonText}>Usar entrada</Text>
                    </Pressable>

                    {is_refundable && (
                      <Pressable
                        style={[styles.button, styles.refundButton]}
                        onPress={handleRefund}
                      >
                        <RotateCcw color="white" size={18} />
                        <Text style={styles.buttonText}>Devolver</Text>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  container: {
    width: "100%",
    height: "98%",
    backgroundColor: colors.background,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 3,
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
  },
  image: {
    width: "90%",
    height: 220,
    borderRadius: 16,
    resizeMode: "cover",
  },
  nextImageButton: {
    position: "absolute",
    bottom: 10,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 6,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    color: "white",
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 2,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  infoStrong: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  description: {
    marginVertical: 16,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  refundBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  refundText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  actions: {
    gap: 10,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buyButton: {
    backgroundColor: colors.primary,
  },
  useButton: {
    backgroundColor: colors.success,
  },
  refundButton: {
    backgroundColor: colors.belandOrange,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
