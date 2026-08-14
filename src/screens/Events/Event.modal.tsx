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
  ArrowDown,
} from "lucide-react-native";
import { eventStore } from "@/stores";
import { colors } from "src/styles";
import { useAuth } from "src/context";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { useNotify } from "src/hooks";
import { convertBeCoinsToUSD, formatUSDPrice } from "src/constants/currency";
import { WrapperModal } from "src/components";
export type EventModalType = {
  id: string;
  isOpen: boolean;
  onClose: () => void;
};
export const EventModal: React.FC<EventModalType> = ({
  id,
  isOpen,
  onClose,
}) => {
  const notify = useNotify();
  const { getEvent } = eventStore();
  const event = getEvent(id);
  const { navigate } = useCustomNavigation();
  const { handleAuth0Login, status } = useAuth();
  const [visibleImage, setVisibleImage] = useState(0);

  const allImages = useMemo(() => {
    if (!event || !event.images_urls?.length) return [event?.image_url];
    return [event.image_url, ...event.images_urls];
  }, [event]);

  const translateAnim = useRef(new Animated.Value(0)).current;
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
    is_refundable,
    refund_days_limit,
    image_url,
    price_usd,
  } = event;
  const isFree = Number(price_usd) === 0;
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
    if (status === "unauthenticated") {
      notify.confirm({
        message: "Debe iniciar sesión para adquirir",
        onConfirm: handleAuth0Login,
      });
      return;
    }
    onClose();
    navigate("NewPaymentScreen", {
      company: { id: name, name, img: image_url },
      product: {
        id,
        name,
        quantity: 1,
        price: Number(price_usd),
        condition: "",
      },
      onSuccessEndpoint: "",
      total_amount: Number(price_usd),
      canBuyForOthers: true,
    });
  };

  const eventStatus =
    end_sale_date && new Date(end_sale_date) < new Date()
      ? { label: "Finalizado", color: colors.textSecondary }
      : { label: "Disponible", color: colors.primary };

  const ticketsLeft = limit_tickets - sold_tickets;

  return (
    <WrapperModal
      isOpen={isOpen}
      onClose={onClose}
      header={
        <Text style={styles.headerTitle} numberOfLines={1}>
          {event.name}
        </Text>
      }
      content={
        <View>
          <View style={styles.imageContainer}>
            <Animated.Image
              source={{ uri: allImages[visibleImage] }}
              resizeMode="cover"
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

            {!isFree ? (
              <View style={styles.section}>
                <View style={styles.infoRow}>
                  <DollarSign size={18} color={colors.primary} />
                  <Text style={styles.infoStrong}>{price_usd} Becoins</Text>
                </View>

                <View style={styles.usdPriceBadge}>
                  <Text style={styles.usdPriceText}>
                    {formatUSDPrice(convertBeCoinsToUSD(Number(price_usd)))}
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
            ) : (
              <View style={styles.section}>
                <Text style={styles.infoStrong}>Gratuito</Text>
              </View>
            )}

            {is_refundable && !isFree && (
              <View style={styles.refundBox}>
                <RotateCcw size={18} color={colors.primary} />
                <Text style={styles.refundText}>
                  Reembolsable hasta {refund_days_limit} días antes del evento
                </Text>
              </View>
            )}
          </View>
        </View>
      }
      actions={
        <Pressable
          style={[styles.button, styles.buyButton]}
          onPress={handleBuy}
          disabled={eventStatus.label !== "Disponible"}
        >
          <Text style={styles.buttonText}>
            {eventStatus.label === "Disponible" ? "Adquirir" : "No disponible"}
          </Text>
        </Pressable>
      }
    />
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  scrollViewContent: {
    // @ts-ignore - Esta propiedad es específica para Web para evitar selecciones y tener desplazamiento fluido
    userSelect: "none",
    // @ts-ignore
    WebkitUserSelect: "none",
  },
  imageContainer: {
    alignItems: "center",
  },
  image: {
    width: "90%",
    height: 220,
    borderRadius: 16,
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
