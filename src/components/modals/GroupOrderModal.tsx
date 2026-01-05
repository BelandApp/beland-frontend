import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GroupService } from "../../services/GroupApiService";
import { useGroupOrders } from "../../hooks/useGroupOrders";
import { useNotify } from "../../hooks/notification/useNotify";

export interface Group {
  id: string;
  name: string;
  description?: string;
  member_count?: number;
  payment_type_id?: string;
  payment_type?: {
    id: string;
    code: "FULL" | "EQUAL_SPLIT" | string;
    description?: string;
  };
}

export interface GroupOrderModalProps {
  visible: boolean;
  onClose: () => void;
  onOrderCreated?: (orderId: string) => void;
  addressId?: string;
  deliveryDetails?: {
    delivery_cost: number;
    distance_km: number;
    duration_min: number;
  };
}

export const GroupOrderModal: React.FC<GroupOrderModalProps> = ({
  visible,
  onClose,
  onOrderCreated,
  addressId,
  deliveryDetails,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createGroupOrder, error: orderError, isLoading } = useGroupOrders();
  const notify = useNotify();

  // Get selected group data
  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  // Helper to determine payment type display info
  const getPaymentTypeInfo = (code?: string, description?: string) => {
    const codeUpper = code?.toUpperCase() || "SPLIT";
    return {
      label:
        codeUpper === "SPLIT"
          ? "Dividir por Consumo"
          : codeUpper === "EQUAL_SPLIT"
          ? "Dividir Equitativamente"
          : codeUpper === "FULL"
          ? "Yo Pago Todo"
          : description || "Método de Pago",
      icon:
        codeUpper === "SPLIT"
          ? "percent"
          : codeUpper === "EQUAL_SPLIT"
          ? "scale-balance"
          : "crown",
      description: description || "Método de pago del grupo",
    };
  };

  const paymentInfo = getPaymentTypeInfo(
    selectedGroup?.payment_type?.code,
    selectedGroup?.payment_type?.description
  );

  /**
   * Load user's groups
   */
  const loadGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      const response = await GroupService.getMyGroups();

      // La API devuelve directamente un array de grupos
      const groupsList = Array.isArray(response)
        ? response
        : response?.data || [];
      setGroups(groupsList);

      // Auto-select first group if available
      if (groupsList && groupsList.length > 0) {
        setSelectedGroupId(groupsList[0].id);
      }
    } catch (error) {
      notify?.error({
        message:
          error instanceof Error ? error.message : "Error cargando grupos",
      });
    } finally {
      setLoadingGroups(false);
    }
  }, [notify]);

  useEffect(() => {
    if (visible) {
      loadGroups();
    }
  }, [visible]);

  /**
   * Handle order creation
   */
  const handleCreateOrder = useCallback(async () => {
    if (!selectedGroupId) {
      notify?.error({ message: "Por favor selecciona un grupo" });
      return;
    }

    if (!selectedGroup?.payment_type_id) {
      notify?.error({
        message: "El grupo no tiene un tipo de pago configurado",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // El grupo ya tiene su payment_type_id configurado, no es necesario pasarlo
      const order = await createGroupOrder({
        groupId: selectedGroupId,
        paymentType: "EQUAL_SPLIT", // Este parámetro ya no se usa, pero se mantiene por compatibilidad
        addressId,
        deliveryDetails,
      });

      if (order) {
        notify?.success({ message: "Orden de grupo creada exitosamente" });
        onOrderCreated?.(order.id);
        onClose();
      }
    } catch (error) {
      console.error("Error creating group order:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedGroupId,
    selectedGroup?.payment_type_id,
    addressId,
    deliveryDetails,
    createGroupOrder,
    onOrderCreated,
    onClose,
    notify,
  ]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerTitle}>Compra en Grupo</Text>
                <Text style={styles.headerSubtitle}>
                  Selecciona grupo y método de pago
                </Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
          >
            {/* Groups Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selecciona un Grupo</Text>

              {loadingGroups ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1976D2" />
                </View>
              ) : groups.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>○</Text>
                  <Text style={styles.emptyStateText}>
                    No tienes grupos disponibles
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    Crea o únete a un grupo para comprar juntos
                  </Text>
                </View>
              ) : (
                groups.map((group) => (
                  <Pressable
                    key={group.id}
                    onPress={() => setSelectedGroupId(group.id)}
                    style={[
                      styles.groupItem,
                      selectedGroupId === group.id && styles.groupItemSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        selectedGroupId === group.id &&
                          styles.radioButtonSelected,
                      ]}
                    >
                      {selectedGroupId === group.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <View style={styles.groupItemContent}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      {group.description && (
                        <Text style={styles.groupDescription} numberOfLines={2}>
                          {group.description}
                        </Text>
                      )}
                      {group.member_count && (
                        <View style={styles.groupMembersInfo}>
                          <MaterialCommunityIcons
                            name="account-multiple"
                            size={14}
                            color="#6BA43A"
                          />
                          <Text style={styles.groupInfo}>
                            {group.member_count} integrante
                            {group.member_count !== 1 ? "s" : ""}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))
              )}
            </View>

            {/* Payment Type Info Section */}
            {groups.length > 0 && selectedGroup && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Método de Pago</Text>

                <View style={styles.paymentInfoCard}>
                  <View style={styles.paymentInfoIconContainer}>
                    <MaterialCommunityIcons
                      name={paymentInfo.icon as any}
                      size={32}
                      color="#6BA43A"
                    />
                  </View>
                  <View style={styles.paymentInfoContent}>
                    <Text style={styles.paymentInfoLabel}>
                      {paymentInfo.label}
                    </Text>
                    <Text style={styles.paymentInfoDescription}>
                      {paymentInfo.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoBullet}>
                    <Text style={styles.infoBulletPoint}>·</Text>
                  </View>
                  <Text style={styles.infoText}>
                    Este método fue configurado al crear el grupo
                  </Text>
                </View>
              </View>
            )}

            {/* Error Message */}
            {orderError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>!</Text>
                <Text style={styles.errorText}>{orderError}</Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.secondaryButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[
                styles.primaryButton,
                (!selectedGroupId || isSubmitting || isLoading) &&
                  styles.primaryButtonDisabled,
              ]}
              onPress={handleCreateOrder}
              disabled={!selectedGroupId || isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Confirmar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GroupOrderModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#757575",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#757575",
    fontWeight: "500",
  },
  scrollContent: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E8F4E6",
    backgroundColor: "#FAFBF8",
  },
  groupItemSelected: {
    borderColor: "#6BA43A",
    backgroundColor: "#F0F9F0",
  },
  groupItemContent: {
    flex: 1,
    marginLeft: 8,
  },
  groupName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 12,
    color: "#9E9E9E",
    marginBottom: 6,
    lineHeight: 16,
  },
  groupInfo: {
    fontSize: 12,
    color: "#6BA43A",
    fontWeight: "600",
  },
  groupMembersInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D4D4D4",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  radioButtonSelected: {
    borderColor: "#6BA43A",
    backgroundColor: "#6BA43A",
  },
  radioButtonInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  paymentContainer: {
    flexDirection: "row",
    gap: 12,
  },
  paymentOption: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#F5F0E8",
    alignItems: "center",
    backgroundColor: "#FFFBF5",
  },
  paymentOptionSelected: {
    borderColor: "#F88D2A",
    backgroundColor: "#FFF7ED",
  },
  paymentOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFF0E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  paymentOptionIconSelected: {
    backgroundColor: "#FFF7ED",
  },
  optionIconText: {
    fontSize: 18,
  },
  paymentOptionContent: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  paymentInfoCard: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#F0F9F0",
    borderWidth: 1.5,
    borderColor: "#6BA43A",
    marginBottom: 12,
    alignItems: "center",
  },
  paymentInfoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#E8F4E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentInfoContent: {
    flex: 1,
  },
  paymentInfoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  paymentInfoDescription: {
    fontSize: 12,
    color: "#424242",
    lineHeight: 16,
  },
  infoCard: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F0F9F0",
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#6BA43A",
  },
  infoBullet: {
    width: 20,
    justifyContent: "flex-start",
  },
  infoBulletPoint: {
    fontSize: 16,
    color: "#6BA43A",
    fontWeight: "bold",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#424242",
    lineHeight: 18,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6BA43A",
    shadowColor: "#6BA43A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: "#BDBDBD",
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  secondaryButtonText: {
    color: "#424242",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    paddingVertical: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
    marginTop: 12,
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 18,
    color: "#C62828",
    fontWeight: "bold",
    marginRight: 8,
  },
  errorText: {
    color: "#C62828",
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  emptyState: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateIcon: {
    fontSize: 40,
    color: "#BDBDBD",
    marginBottom: 12,
  },
  emptyStateText: {
    color: "#757575",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyStateSubtext: {
    color: "#9E9E9E",
    fontSize: 12,
    textAlign: "center",
  },
});
