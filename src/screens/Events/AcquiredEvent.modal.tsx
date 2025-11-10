import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import {
  ArrowLeftRight,
  Calendar,
  MapPin,
  RotateCcw,
  SquareChevronDown,
  CheckCircle2,
} from "lucide-react-native";
import { useEventStore } from "src/stores/Event";
import { colors } from "src/styles";
import { useCustomAlert } from "src/hooks";
import { CustomAlert } from "@components/shared";
import { eventsService } from "src/services/events";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

export const AcquiredEventModal = ({ route }: { route: any }) => {
  const { id_modal } = route.params;
  const { getAcquiredEvent } = useEventStore();
  const event = getAcquiredEvent(id_modal);
  const { navigate, goBack } = useCustomNavigation();
  const { showCustomAlert, alertConfig, showAlert, hideAlert } =
    useCustomAlert();
  const [visibleImage, setVisibleImage] = useState(0);
  console.log(event);
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
    images_urls,
    user_attended,
    purchase_price,
    user_pass_id,
    holder_name,
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

  const handleUse = () => navigate("UseEventScreen", { id: id_modal });
  const handleRefund = async () => {
    showCustomAlert("Procesando reembolso...", "", "info");
    if (!purchase_price || !user_pass_id)
      return Alert.alert("Error", "No se pudo procesar el reembolso");
    if (purchase_price === "0.00") {
      const response = await eventsService.refundEvent(user_pass_id);
      alert(response.message);
    }
  };

  const eventStatus = (() => {
    if (user_attended) return { label: "Usado", color: colors.success };
    if (end_sale_date && new Date(end_sale_date) < new Date())
      return { label: "Finalizado", color: colors.textSecondary };
    return { label: "Adquirido", color: colors.belandOrange };
  })();

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

              {is_refundable && !user_attended && (
                <View style={[styles.refundBox]}>
                  <RotateCcw color={colors.primary} size={18} />
                  <Text style={styles.refundText}>
                    Reembolsable hasta {refund_days_limit} días antes del
                    evento.
                  </Text>
                </View>
              )}

              <View style={styles.actions}>
                {!user_attended ? (
                  <>
                    <Text style={styles.infoText}>
                      Entrada a nombre de: {holder_name}
                    </Text>
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
                ) : (
                  <Text style={styles.infoStrong}>Ya usaste esta entrada</Text>
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
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.primary,
    paddingVertical: 8,
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
