import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import {
  ArrowLeftRight,
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  RotateCcw,
  SquareChevronDown,
} from "lucide-react-native";
import { eventStore } from "@/stores";
import { colors } from "src/styles";
import { useAuth } from "src/context";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { useNotify } from "src/hooks";
import { convertBeCoinsToUSD, formatUSDPrice } from "src/constants/currency";

export const EventModal = ({ route }: { route: any }) => {
  const { id } = route.params;
  const notify = useNotify();
  const { getEvent } = eventStore();
  const event = getEvent(id);
  const { navigate, goBack } = useCustomNavigation();
  const { canPerformAction, handleAuth0Login } = useAuth();
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
  } = event;

  const allImages = useMemo(() => {
    if (!images_urls || images_urls.length === 0) return [image_url];
    return [image_url, ...images_urls];
  }, [image_url, images_urls]);

  const translateAnim = useRef(new Animated.Value(0)).current;

  const handleNextImage = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(translateAnim, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setVisibleImage((prev) => (prev + 1) % allImages.length);
    });
  };
  // const canRefund = new Date() -;
  const handleClose = () => goBack();

  const handleBuy = async () => {
    if (!canPerformAction) {
      notify.confirm({
        message: "Debe iniciar sesión para adquirir",
        onConfirm: () => handleAuth0Login(),
      });
      return;
    }
    navigate("NewPaymentScreen", {
      company: { id: name, name, img: image_url },
      product: {
        id,
        name,
        quantity: 1,
        price: Number(price_becoin),
        condition: "Llevar elementos reciclables al evento",
      },
      onSuccessEndpoint: "",
      total_amount: Number(price_becoin),
      canBuyForOthers: true,
    });
  };

  const eventStatus = (() => {
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
                style={[
                  styles.image,
                  {
                    opacity: 1,
                    transform: [{ translateX: translateAnim }],
                  },
                ]}
              />
              {allImages.length > 1 && (
                <Pressable
                  style={styles.nextImageButton}
                  onPress={handleNextImage}
                >
                  <ArrowLeftRight color="white" size={20} />
                </Pressable>
              )}
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
              <Text style={styles.name}>{name}</Text>
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

              <Text style={styles.description}>{description}</Text>

              <View style={styles.section}>
                <View style={styles.priceContainer}>
                  <View style={styles.infoRow}>
                    <DollarSign size={18} color={colors.primary} />
                    <Text style={styles.infoStrong}>
                      {price_becoin} Becoins
                    </Text>
                  </View>
                  {/* Badge de precio en USD */}
                  <View style={styles.usdPriceBadge}>
                    <Text style={styles.usdPriceText}>
                      ≈ $
                      {formatUSDPrice(
                        convertBeCoinsToUSD(Number(price_becoin))
                      )}{" "}
                      USD
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Ticket size={18} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    {ticketsLeft} tickets disponibles
                  </Text>
                </View>
              </View>

              {is_refundable && (
                <View style={[styles.refundBox]}>
                  <RotateCcw color={colors.primary} size={18} />
                  <Text style={styles.refundText}>
                    Reembolsable hasta {refund_days_limit} días antes del
                    evento.
                  </Text>
                </View>
              )}

              <View style={styles.actions}>
                <Pressable
                  style={[styles.button, styles.buyButton]}
                  onPress={handleBuy}
                >
                  <Text style={styles.buttonText}>Adquirir</Text>
                </Pressable>
              </View>
            </View>
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
  priceContainer: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 8,
  },
  usdPriceBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usdPriceText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
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
