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
  WithdrawService,
  WithdrawAccount,
} from "../../../services/withdrawService";
import { AddWithdrawAccountModal } from "./AddWithdrawAccountModal";
import { useNotify } from "src/hooks";
import { getBackendErrorMessage } from "src/services";

interface PaymentPreferencesProps {
  onRefresh?: () => void;
}

export const PaymentPreferences: React.FC<PaymentPreferencesProps> = ({
  onRefresh,
}) => {
  const notify = useNotify();
  // TODO HACER UN HOOK
  const [accounts, setAccounts] = useState<WithdrawAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMethodMenu, setActiveMethodMenu] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  // Cargar cuentas al montar el componente
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      const response = await WithdrawService.getWithdrawAccounts();

      // Validación defensiva: asegurar que response.data sea un array
      const accountsData = Array.isArray(response.data) ? response.data : [];

      setAccounts(accountsData);
    } catch (error) {
      console.error("❌ Error cargando cuentas:", error);
      const message = getBackendErrorMessage(error);
      notify.error({ message: message || "Error cargando cuentas de retiro" });
      setAccounts([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    try {
      // Cerrar el modal inmediatamente
      setShowAddModal(false);

      // El modal ya maneja la creación internamente
      await loadAccounts(); // Recargar lista
      onRefresh?.(); // Notificar al componente padre

      notify.success({ message: "Cuenta creada exitosamente" });
    } catch (error: any) {
      const message = getBackendErrorMessage(error);
      notify.error({ message: message || "Error creando cuenta de retiro" });
    }
  };

  const getMethodIcon = (account: WithdrawAccount) => {
    const accountTypeName = account.type?.name?.toLowerCase() || "";

    if (
      accountTypeName.includes("payphone") ||
      account.provider?.toLowerCase() === "payphone"
    ) {
      return <PayphoneIcon />;
    }

    return <Building2 size={18} color="#666" />;
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
      await WithdrawService.deleteWithdrawAccount(accountToDelete.id);
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
      notify.error({ message });
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
      await WithdrawService.activateWithdrawAccount(accountId);
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
          <Plus size={18} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <CreditCard size={24} color="#999" strokeWidth={1.5} />
          <Text style={styles.emptyText}>No hay cuentas agregadas</Text>
        </View>
      ) : (
        <View style={styles.methodsList}>
          {accounts.map((account, index) => (
            <View key={account.id} style={styles.methodCard}>
              <View style={styles.methodRow}>
                <View style={styles.methodIconSimple}>
                  {getMethodIcon(account)}
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle} numberOfLines={1}>
                    {getMethodTitle(account)}
                  </Text>
                  <Text style={styles.methodSubtitle} numberOfLines={1}>
                    {getMethodSubtitle(account)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleMethodOptions(account)}
                >
                  <MoreVertical size={20} color="#999" strokeWidth={2} />
                </TouchableOpacity>
              </View>
              {!account.is_active && (
                <View style={styles.inactiveLabel}>
                  <Text style={styles.inactiveLabelText}>Inactiva</Text>
                </View>
              )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginTop: 16,
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
  },
  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: "#999",
  },
  methodsList: {
    gap: 8,
  },
  methodCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  methodIconSimple: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  deleteButton: {
    padding: 4,
  },
  inactiveLabel: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  inactiveLabelText: {
    fontSize: 11,
    color: "#FF6B6B",
    fontWeight: "500",
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
