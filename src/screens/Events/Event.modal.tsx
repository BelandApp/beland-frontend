import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
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
import Toast from "react-native-toast-message";
import { toastConfig } from "src/components/shared/notification/GlobalNotification";
import WarpperModal from "src/components/shared/modals/wrapperModal";

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
    if (!images_urls?.length) return [image_url];
    return [image_url, ...images_urls];
  }, [image_url, images_urls]);

  const translateAnim = useRef(new Animated.Value(0)).current;

  const handleNextImage = () => {
    Animated.sequence([
      Animated.timing(translateAnim, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisibleImage((prev) => (prev + 1) % allImages.length);
    });
  };

  const handleBuy = async () => {
    if (!canPerformAction) {
      notify.confirm({
        message: "Debe iniciar sesión para adquirir",
        onConfirm: handleAuth0Login,
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

  const eventStatus =
    end_sale_date && new Date(end_sale_date) < new Date()
      ? { label: "Finalizado", color: colors.textSecondary }
      : { label: "Disponible", color: colors.primary };

  const ticketsLeft = limit_tickets - sold_tickets;

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={goBack} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Header */}
        <Pressable onPress={goBack} style={styles.close}>
          <SquareChevronDown size={26} color={colors.textSecondary} />
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            <Animated.Image
              source={{ uri: allImages[visibleImage] }}
              style={[
                styles.image,
                { transform: [{ translateX: translateAnim }] },
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

          {/* INFO */}
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
              <View style={styles.infoRow}>
                <DollarSign size={18} color={colors.primary} />
                <Text style={styles.infoStrong}>{price_becoin} Becoins</Text>
              </View>

              <View style={styles.usdPriceBadge}>
                <Text style={styles.usdPriceText}>
                  ≈ ${formatUSDPrice(convertBeCoinsToUSD(Number(price_becoin)))}{" "}
                  USD
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ticket size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {ticketsLeft} tickets disponibles
                </Text>
              </View>
            </View>

            {is_refundable && (
              <View style={styles.refundBox}>
                <RotateCcw size={18} color={colors.primary} />
                <Text style={styles.refundText}>
                  Reembolsable hasta {refund_days_limit} días antes del evento
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Acciones */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.button, styles.buyButton]}
            onPress={handleBuy}
            disabled={eventStatus.label !== "Disponible"}
          >
            <Text style={styles.buttonText}>
              {eventStatus.label === "Disponible"
                ? "Adquirir"
                : "No disponible"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Dimensions.get("window").height * 0.9,
    paddingTop: 8,
  },
  close: {
    alignSelf: "flex-end",
    padding: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  imageContainer: {
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
    bottom: 12,
    right: 24,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 6,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 24,
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
    marginBottom: 12,
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  infoStrong: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  description: {
    marginVertical: 16,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
  usdPriceBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginVertical: 6,
  },
  usdPriceText: {
    color: "white",
    fontWeight: "700",
  },
  refundBox: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  refundText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buyButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
