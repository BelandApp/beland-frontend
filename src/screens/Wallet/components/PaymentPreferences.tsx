import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Plus, CreditCard, Building2, MoreVertical } from "lucide-react-native";
import PayphoneIcon from "src/components/icons/PayphoneIcon";
import {
  withdrawService,
  WithdrawAccount,
} from "../../../services/withdrawService";
import { AddWithdrawAccountModal } from "./AddWithdrawAccountModal";
import { CustomAlert } from "../../../components/ui/CustomAlert";

interface PaymentPreferencesProps {
  onRefresh?: () => void;
}

export const PaymentPreferences: React.FC<PaymentPreferencesProps> = ({
  onRefresh,
}) => {
  const [accounts, setAccounts] = useState<WithdrawAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMethodMenu, setActiveMethodMenu] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Ref para evitar múltiples alerts
  const isShowingAlert = useRef(false);

  // Cargar cuentas al montar el componente
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      console.log("📋 Cargando cuentas de retiro...");
      const response = await withdrawService.getWithdrawAccounts();
      console.log("📋 Cuentas obtenidas:", response.accounts);
      response.accounts.forEach((account, index) => {
        console.log(`📋 Cuenta ${index + 1}:`, {
          id: account.id,
          owner_name: account.owner_name,
          is_active: account.is_active,
          type: account.type?.name,
        });
      });
      setAccounts(response.accounts);
    } catch (error) {
      console.error("❌ Error cargando cuentas:", error);
      console.error(
        "No se pudieron cargar las cuentas de retiro. Intenta nuevamente."
      );
      // En una implementación real, podrías mostrar un toast o un mensaje en la UI
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    try {
      // Prevenir múltiples alerts
      if (isShowingAlert.current) {
        return;
      }

      // Cerrar el modal inmediatamente
      setShowAddModal(false);

      // El modal ya maneja la creación internamente
      await loadAccounts(); // Recargar lista
      onRefresh?.(); // Notificar al componente padre

      // Mostrar alert de éxito usando CustomAlert
      isShowingAlert.current = true;
      setShowSuccessAlert(true);

      // Cerrar automáticamente después de 3 segundos
      setTimeout(() => {
        setShowSuccessAlert(false);
        isShowingAlert.current = false;
      }, 3000);
    } catch (error: any) {
      console.error("Error refrescando cuentas:", error);
    }
  };

  const getMethodIcon = (account: WithdrawAccount) => {
    const accountTypeName = account.type?.name?.toLowerCase() || "";

    if (
      accountTypeName.includes("payphone") ||
      account.provider?.toLowerCase() === "payphone"
    ) {
      return (
        <View style={styles.methodIconMP}>
          <PayphoneIcon />
        </View>
      );
    }

    return <Building2 size={20} color="#333" />;
  };

  const getMethodTitle = (account: WithdrawAccount) => {
    const accountTypeName = account.type?.name || "Cuenta";

    if (
      accountTypeName.toLowerCase().includes("payphone") ||
      account.provider?.toLowerCase() === "payphone"
    ) {
      return "Payphone";
    }

    return accountTypeName;
  };

  const getMethodSubtitle = (account: WithdrawAccount) => {
    const accountTypeName = account.type?.name?.toLowerCase() || "";

    if (
      accountTypeName.includes("payphone") ||
      account.provider?.toLowerCase() === "payphone"
    ) {
      return account.phone || "Teléfono no disponible";
    }

    // Para cuentas bancarias, mostrar CBU o alias
    if (account.cbu) {
      return `CBU: ${account.cbu.slice(-4)}`;
    }

    if (account.alias) {
      return `Alias: ${account.alias}`;
    }

    return "Cuenta bancaria";
  };

  const handleMethodOptions = (account: WithdrawAccount) => {
    console.log("⋮ Abriendo menú para cuenta:", account.id, account.owner_name);
    setActiveMethodMenu(account.id);
  };

  const closeMethodMenu = () => {
    setActiveMethodMenu(null);
  };

  const handleDeleteAccount = async (accountId: string) => {
    console.log("🗑️ Iniciando eliminación de cuenta:", accountId);

    // Encontrar el nombre de la cuenta para mostrarlo en el mensaje
    const account = accounts.find((acc) => acc.id === accountId);
    const accountName = account ? account.owner_name : "esta cuenta";

    console.log("📋 Cuenta a eliminar:", { accountId, accountName, account });

    // Configurar el modal de confirmación
    setAccountToDelete({ id: accountId, name: accountName });
    setShowDeleteModal(true);
    closeMethodMenu();
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;

    console.log("🚀 Usuario confirmó - Eliminando cuenta:", accountToDelete.id);
    try {
      setLoading(true);
      setShowDeleteModal(false);
      console.log("📞 Llamando a withdrawService.deleteWithdrawAccount...");
      await withdrawService.deleteWithdrawAccount(accountToDelete.id);
      console.log("✅ Eliminación completada");
      // No mostrar alert, solo recargar la lista
      console.log("🔄 Recargando lista de cuentas...");
      await loadAccounts();
    } catch (error: any) {
      console.error("❌ Error en eliminación:", error);

      let message = "No se pudo eliminar la cuenta.";

      if (error?.message?.includes("404")) {
        message = "La cuenta no existe.";
      } else if (error?.message?.includes("409")) {
        message = "No se puede eliminar, tiene transacciones asociadas.";
      } else if (error?.message?.includes("403")) {
        message = "No tienes permisos para eliminar esta cuenta.";
      } else if (error?.message) {
        message = error.message;
      }

      // Mostrar error usando CustomAlert
      setErrorMessage(message);
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
      setAccountToDelete(null);
    }
  };

  const cancelDeleteAccount = () => {
    console.log("❌ Usuario canceló la eliminación");
    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  const handleActivateAccount = async (accountId: string) => {
    try {
      await withdrawService.activateWithdrawAccount(accountId);
      // No usamos Alert.alert aquí tampoco
      await loadAccounts();
      closeMethodMenu();
    } catch (error: any) {
      console.error("Error activando cuenta:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cuentas de retiro</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Cargando cuentas...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cuentas de retiro</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <CreditCard size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No tienes cuentas de retiro</Text>
          <Text style={styles.emptySubtitle}>
            Agrega tu primera cuenta para retirar tus BeCoins
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={16} color="#fff" />
            <Text style={styles.emptyButtonText}>Agregar cuenta</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.methodsList}>
          {accounts.map((account, index) => (
            <View
              key={account.id}
              style={[
                styles.methodCard,
                index % 2 === 1 && styles.methodCardRight,
                !account.is_active && styles.methodCardInactive,
              ]}
            >
              {/* Header con estado y botón de opciones */}
              <View style={styles.cardHeader}>
                <View style={styles.leftSpacer} />
                <View style={styles.rightSection}>
                  {!account.is_active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>Inactiva</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.optionsButton}
                    onPress={() => handleMethodOptions(account)}
                  >
                    <MoreVertical size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.methodContent}>
                <View style={styles.methodIcon}>{getMethodIcon(account)}</View>
                <View style={styles.methodInfo}>
                  <View style={styles.methodHeader}>
                    <Text style={styles.methodTitle} numberOfLines={1}>
                      {getMethodTitle(account)}
                    </Text>
                  </View>
                  <Text style={styles.methodSubtitle} numberOfLines={1}>
                    {getMethodSubtitle(account)}
                  </Text>
                  <Text style={styles.methodAlias} numberOfLines={1}>
                    {account.alias}
                  </Text>
                </View>
              </View>

              {/* Menu de opciones */}
              {activeMethodMenu === account.id && (
                <Modal
                  transparent
                  visible={true}
                  onRequestClose={closeMethodMenu}
                  animationType="fade"
                >
                  <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={closeMethodMenu}
                  >
                    <View style={styles.menuContainer}>
                      {/* Solo opción para eliminar cuenta */}
                      <TouchableOpacity
                        style={styles.menuOption}
                        onPress={() => {
                          console.log(
                            "🗑️ Botón eliminar presionado para cuenta:",
                            account.id
                          );
                          handleDeleteAccount(account.id);
                        }}
                      >
                        <Text
                          style={[styles.menuOptionText, { color: "#dc3545" }]}
                        >
                          Eliminar cuenta
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Modal para agregar nueva cuenta */}
      <AddWithdrawAccountModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMethod}
      />

      {/* Modal de confirmación para eliminar cuenta */}
      <Modal visible={showDeleteModal} transparent={true} animationType="fade">
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalIcon}>
              <Text style={styles.deleteModalIconText}>⚠️</Text>
            </View>
            <Text style={styles.deleteModalTitle}>Eliminar cuenta</Text>
            <Text style={styles.deleteModalMessage}>
              {accountToDelete
                ? `¿Eliminar la cuenta de ${accountToDelete.name}?\n\nEsta acción no se puede deshacer.`
                : "Confirmar eliminación"}
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[
                  styles.deleteModalButton,
                  styles.deleteModalCancelButton,
                ]}
                onPress={cancelDeleteAccount}
              >
                <Text style={styles.deleteModalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deleteModalButton,
                  styles.deleteModalConfirmButton,
                ]}
                onPress={confirmDeleteAccount}
              >
                <Text style={styles.deleteModalConfirmText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CustomAlert para cuenta creada exitosamente */}
      <CustomAlert
        visible={showSuccessAlert}
        type="success"
        title="¡Cuenta agregada!"
        message="Tu cuenta de retiro ha sido creada exitosamente y ya está disponible para usar."
        onClose={() => {
          setShowSuccessAlert(false);
          isShowingAlert.current = false;
        }}
      />

      {/* CustomAlert para errores */}
      <CustomAlert
        visible={showErrorAlert}
        type="error"
        title="Error"
        message={errorMessage}
        onClose={() => setShowErrorAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF5F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B35",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  methodsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  methodCard: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    width: "48%", // Para que quepan 2 lado a lado
    minHeight: 120,
  },
  methodCardRight: {
    marginLeft: 0, // Sin margen adicional ya que flexWrap maneja el espaciado
  },
  methodCardInactive: {
    backgroundColor: "#f5f5f5",
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    minHeight: 24,
    marginBottom: 8,
  },
  leftSpacer: {
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  methodContent: {
    flexDirection: "column", // Cambiado a column para layout vertical
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  methodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignSelf: "center",
  },
  methodIconMP: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  methodIconText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  methodInfo: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  methodHeader: {
    justifyContent: "center",
    marginBottom: 4,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  defaultBadge: {
    backgroundColor: "#7FB069",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  defaultBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  inactiveBadge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  inactiveBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  methodSubtitle: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
    textAlign: "center",
  },
  methodAlias: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
  },
  optionsButton: {
    padding: 4,
  },
  // Estilos para el menú de opciones
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuOptionDanger: {
    borderBottomWidth: 0,
  },
  menuOptionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  menuOptionTextDanger: {
    color: "#FF3B30",
  },
  // Estilos para Modal de Eliminación
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  deleteModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 300,
    maxWidth: 400,
  },
  deleteModalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff3cd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#ffc107",
  },
  deleteModalIconText: {
    fontSize: 32,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteModalCancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  deleteModalConfirmButton: {
    backgroundColor: "#dc3545",
  },
  deleteModalCancelText: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "600",
  },
  deleteModalConfirmText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
