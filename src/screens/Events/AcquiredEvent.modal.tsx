import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  ArrowLeftRight,
  Calendar,
  MapPin,
  RotateCcw,
  CheckCircle2,
} from "lucide-react-native";
import { eventStore } from "@/stores";
import { colors } from "src/styles";
import { eventsService } from "src/services/events";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { useNotify } from "src/hooks";
import { canRefundTicket } from "./helpers/canrefund";
import { WrapperModal } from "src/components";
export const AcquiredEventModal = ({ route }: { route: any }) => {
  const { id_modal } = route.params;
  const { getAcquiredEvent } = eventStore();
  const event = getAcquiredEvent(id_modal);
  const { navigate } = useCustomNavigation();
  const notify = useNotify();
  const [visibleImage, setVisibleImage] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
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
    is_refundable,
    refund_days_limit,
    user_attended,
    purchase_price,
    user_pass_id,
    holder_name,
  } = event;

  const handleClose = () => {
    setIsOpen(false);
    const targetTab =
      new Date(end_sale_date) < new Date() ? "Anteriores" : "Próximos";

    setTimeout(() => {
      navigate("MisEntradas", { tab: targetTab });
    }, 300);
  };

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
  const canRefund = useMemo(
    () =>
      canRefundTicket({
        is_refundable,
        refund_days_limit: refund_days_limit === null ? 3 : refund_days_limit,
        event_date,
        user_attended,
        end_sale_date,
      }),
    [is_refundable, refund_days_limit, event_date, user_attended, end_sale_date]
  );

  const handleUse = () => navigate("UseEventScreen", { id: id_modal });
  const handleRefund = async () => {
    notify.info({ message: "Procesando reembolso..." });
    if (!purchase_price || !user_pass_id)
      return notify.error({ message: "No se pudo procesar el reembolso" });
    const response = await eventsService.refundEvent(user_pass_id);
    notify.info(response.message);
  };

  const eventStatus = (() => {
    if (user_attended) return { label: "Usado", color: colors.success };
    if (end_sale_date && new Date(end_sale_date) < new Date())
      return { label: "Finalizado", color: colors.textSecondary };
    return { label: "Adquirido", color: colors.belandOrange };
  })();

  return (
    <WrapperModal
      isOpen={isOpen}
      onClose={handleClose}
      header={
        <Text style={styles.headerTitle} numberOfLines={1}>
          {event.name}
        </Text>
      }
      content={
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
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

              {is_refundable && !user_attended && (
                <View style={[styles.refundBox]}>
                  <RotateCcw color={colors.primary} size={18} />
                  <Text style={styles.refundText}>
                    {canRefund
                      ? `Reembolsable hasta ${refund_days_limit} días antes del evento.`
                      : "Este evento ya no admite reembolsos."}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      }
      actions={
        <View style={styles.footer}>
          {!user_attended ? (
            <>
              <Text style={styles.infoText}>
                Entrada a nombre de: {holder_name}
              </Text>
              {canRefund && (
                <Pressable
                  style={[styles.button, styles.refundButton]}
                  onPress={handleRefund}
                >
                  <RotateCcw color="white" size={18} />
                  <Text style={styles.buttonText}>Devolver</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.button, styles.useButton]}
                onPress={handleUse}
              >
                <CheckCircle2 color="white" size={18} />
                <Text style={styles.buttonText}>Usar entrada</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.infoStrong}>Ya usaste esta entrada</Text>
          )}
        </View>
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
    paddingTop: 20,
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
    textAlign: "center",
  },
  infoStrong: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 8,
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
  footer: {
    alignItems: "center",
    gap: 5,
    flexDirection: Dimensions.get("window").width > 600 ? "row" : "column",
    marginHorizontal: "auto",
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  useButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
  },
  refundButton: {
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
