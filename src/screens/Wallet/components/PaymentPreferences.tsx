import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Plus, CreditCard, Building2, MoreVertical } from "lucide-react-native";
import PayphoneIcon from "src/components/icons/PayphoneIcon";
import {
  WithdrawService,
  WithdrawAccount,
} from "../../../services/withdrawService";
import AddWithdrawAccountModal from "./AddWithdrawAccountModal";
import useAddWithdrawAccount from "../hooks/useAddWithdrawAccount";
import { useNotify } from "src/hooks";
import { getBackendErrorMessage } from "src/services";

export const PaymentPreferences: React.FC<{ onRefresh?: () => void }> = ({
  onRefresh,
}) => {
  const notify = useNotify();
  const [accounts, setAccounts] = useState<WithdrawAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [showFullView, setShowFullView] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<WithdrawAccount | null>(null);
  const [activeMethodMenu, setActiveMethodMenu] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const resp = await WithdrawService.getWithdrawAccounts();
      // Accept both paginated [items,total] and direct array
      const items = Array.isArray((resp as any)?.data)
        ? (resp as any).data
        : Array.isArray(resp) && Array.isArray(resp[0])
        ? resp[0]
        : Array.isArray(resp)
        ? resp
        : [];
      setAccounts(items || []);
    } catch (error: any) {
      console.error("Error cargando cuentas:", error);
      const message = getBackendErrorMessage(error);
      notify.error({ message: message || "Error cargando cuentas de retiro" });
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = async () => {
    setShowAddModal(false);
    await loadAccounts();
    onRefresh?.();
    notify.success({ message: "Cuenta creada exitosamente" });
  };

  const addHook = useAddWithdrawAccount({
    visible: showAddModal,
    onAdd: handleAddSuccess,
    onClose: () => setShowAddModal(false),
  });

  const getMethodIcon = (account: WithdrawAccount) => {
    const accountTypeName = (
      account.type?.name ||
      account.withdraw_account_type?.name ||
      ""
    ).toLowerCase();
    if (
      accountTypeName.includes("payphone") ||
      account.provider?.toLowerCase() === "payphone"
    ) {
      return <PayphoneIcon />;
    }
    return <Building2 size={18} color="#666" />;
  };

  const getMethodTitle = (account: WithdrawAccount) => {
    const accountTypeName =
      account.type?.name || account.withdraw_account_type?.name || "Cuenta";
    if (
      accountTypeName.toLowerCase().includes("payphone") ||
      account.provider?.toLowerCase() === "payphone"
    ) {
      return "Payphone";
    }
    return accountTypeName;
  };

  const getMethodSubtitle = (account: WithdrawAccount) => {
    if (account.cbu) return `CBU •••• ${String(account.cbu).slice(-4)}`;
    if (account.alias) return `Alias ${account.alias}`;
    if (account.phone) return account.phone;
    return "Cuenta";
  };

  const handleMethodOptions = (account: WithdrawAccount) => {
    setActiveMethodMenu(account.id);
  };

  const closeMethodMenu = () => setActiveMethodMenu(null);

  const handleDeleteAccount = (accountId: string) => {
    const acc = accounts.find((a) => a.id === accountId);
    setAccountToDelete({
      id: accountId,
      name: acc?.owner_name || "esta cuenta",
    });
    setShowDeleteModal(true);
    closeMethodMenu();
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    try {
      setLoading(true);
      await WithdrawService.deleteWithdrawAccount(accountToDelete.id);
      await loadAccounts();
      setShowDeleteModal(false);
      setAccountToDelete(null);
      notify.success({ message: "Cuenta eliminada" });
    } catch (error: any) {
      console.error("Error eliminando cuenta:", error);
      const msg =
        getBackendErrorMessage(error) || "No se pudo eliminar la cuenta";
      notify.error({ message: msg });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  const handleActivate = async (id: string) => {
    try {
      await WithdrawService.activateWithdrawAccount(id);
      await loadAccounts();
      closeMethodMenu();
      notify.success({ message: "Cuenta activada" });
    } catch (error: any) {
      console.error("Error activando:", error);
      notify.error({ message: getBackendErrorMessage(error) || "Error" });
    }
  };

  if (loading) {
    return (
      <View className="bg-white rounded-lg p-4 mt-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-semibold text-gray-900">
            Cuentas de retiro
          </Text>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
          >
            <Plus size={18} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        <View className="items-center py-6">
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className="mt-2 text-sm text-gray-500">
            Cargando cuentas...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      {/* Compact card */}
      <View className="bg-white rounded-lg p-4 mt-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-semibold text-gray-900">
            Cuentas de retiro
          </Text>
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={() => setShowFullView(true)}
              className="px-3 py-1"
            >
              <Text className="text-sm text-orange-500 font-semibold">
                Ver todo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Plus size={18} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
          className="pt-1"
        >
          {accounts.slice(0, 2).map((account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() => {
                setSelectedAccount(account);
                setShowAccountDetails(true);
              }}
              className="bg-white rounded-2xl p-4 mr-3 border border-gray-100 shadow-md"
              style={{ minWidth: 220, overflow: "hidden" }}
            >
              <View className="flex-row items-start">
                <View className="w-12 h-12 bg-gray-50 rounded-lg items-center justify-center mr-3">
                  {getMethodIcon(account)}
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold text-gray-900"
                    numberOfLines={2}
                  >
                    {getMethodTitle(account)}
                  </Text>
                  {account.owner_name ? (
                    <Text
                      className="text-xs text-gray-500 mt-1"
                      numberOfLines={2}
                    >
                      {account.owner_name}
                    </Text>
                  ) : null}
                  <Text
                    className="text-xs text-gray-500 mt-1"
                    numberOfLines={2}
                  >
                    {getMethodSubtitle(account)}
                  </Text>
                </View>
                {account.is_active && (
                  <View className="ml-2 mt-1 bg-green-100 border border-green-200 px-2 py-1 rounded-full">
                    <Text className="text-xs text-green-700 font-semibold">
                      VERIFICADA
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="w-56 h-28 rounded-2xl border-2 border-dashed border-gray-200 items-center justify-center mr-3 bg-white shadow-sm"
            style={{ overflow: "hidden" }}
          >
            <View className="w-12 h-12 rounded-full bg-gray-50 items-center justify-center mb-2">
              <Text className="text-2xl text-gray-400">+</Text>
            </View>
            <Text className="text-sm text-gray-500">Agregar cuenta nueva</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Full list modal */}
      <Modal
        visible={showFullView}
        animationType="slide"
        onRequestClose={() => setShowFullView(false)}
      >
        <View className="flex-1 bg-white">
          <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
            <Text className="text-lg font-semibold">Cuentas de retiro</Text>
            <TouchableOpacity onPress={() => setShowFullView(false)}>
              <Text className="text-orange-500 font-semibold">Cerrar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="p-4 space-y-3">
            {accounts.length === 0 ? (
              <View className="flex-row items-center justify-center py-8">
                <CreditCard size={24} color="#999" strokeWidth={1.5} />
                <Text className="ml-2 text-sm text-gray-500">
                  No hay cuentas agregadas
                </Text>
              </View>
            ) : (
              accounts.map((account) => (
                <View
                  key={account.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 items-center justify-center mr-3">
                      {getMethodIcon(account)}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {getMethodTitle(account)}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {getMethodSubtitle(account)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="p-1"
                      onPress={() => handleMethodOptions(account)}
                    >
                      <MoreVertical size={20} color="#999" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  {!account.is_active && (
                    <View className="mt-2 pt-2 border-t border-gray-100">
                      <Text className="text-xs text-red-500 font-semibold">
                        Inactiva
                      </Text>
                    </View>
                  )}

                  {activeMethodMenu === account.id && (
                    <Modal
                      transparent
                      visible={true}
                      onRequestClose={closeMethodMenu}
                      animationType="fade"
                    >
                      <TouchableOpacity
                        className="flex-1 bg-black/30 justify-center items-center"
                        activeOpacity={1}
                        onPress={closeMethodMenu}
                      >
                        <View className="bg-white rounded-lg p-2 min-w-[200px] shadow-lg">
                          <TouchableOpacity
                            className="py-3 px-4 border-b border-gray-100"
                            onPress={() => handleDeleteAccount(account.id)}
                          >
                            <Text className="text-center text-base text-red-600">
                              Eliminar cuenta
                            </Text>
                          </TouchableOpacity>
                          {!account.is_active && (
                            <TouchableOpacity
                              className="py-3 px-4"
                              onPress={() => handleActivate(account.id)}
                            >
                              <Text className="text-center text-base text-green-600">
                                Activar cuenta
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Detalle rápido de cuenta al tocar tarjeta */}
      {selectedAccount && (
        <Modal
          visible={showAccountDetails}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAccountDetails(false)}
        >
          <View className="flex-1 bg-black/60 justify-center items-center p-4">
            <View className="bg-white rounded-xl p-6 w-full max-w-md">
              <View className="flex-row justify-between items-start">
                <Text className="text-lg font-bold">Detalle de cuenta</Text>
                <TouchableOpacity onPress={() => setShowAccountDetails(false)}>
                  <Text className="text-sm text-gray-500">Cerrar</Text>
                </TouchableOpacity>
              </View>

              <View className="mt-3 space-y-2">
                <Text className="text-sm text-gray-700">
                  <Text className="font-semibold">Tipo: </Text>
                  {getMethodTitle(selectedAccount)}
                </Text>
                <Text className="text-sm text-gray-700">
                  <Text className="font-semibold">Titular: </Text>
                  {selectedAccount.holderName ||
                    selectedAccount.owner_name ||
                    "-"}
                </Text>
                <Text className="text-sm text-gray-700">
                  <Text className="font-semibold">CBU: </Text>
                  {selectedAccount.cbu || "-"}
                </Text>
                <Text className="text-sm text-gray-700">
                  <Text className="font-semibold">Alias: </Text>
                  {selectedAccount.alias || "-"}
                </Text>
                <Text className="text-sm text-gray-700">
                  <Text className="font-semibold">Teléfono: </Text>
                  {selectedAccount.phone || "-"}
                </Text>
              </View>

              {/* Removed duplicated footer close button (header already has close) */}
            </View>
          </View>
        </Modal>
      )}

      {/* Delete confirm modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-md">
            <View className="w-14 h-14 rounded-full bg-amber-100 border border-amber-200 justify-center items-center mb-4">
              <Text className="text-2xl">⚠️</Text>
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Eliminar cuenta
            </Text>
            <Text className="text-base text-gray-600 mb-4">
              {accountToDelete
                ? `¿Eliminar la cuenta de ${accountToDelete.name}?\n\nEsta acción no se puede deshacer.`
                : "Confirmar eliminación"}
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg bg-gray-100 items-center"
                onPress={cancelDelete}
              >
                <Text className="text-base text-gray-700">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg bg-red-600 items-center"
                onPress={confirmDeleteAccount}
              >
                <Text className="text-base text-white">Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal y lógica SIEMPRE renderizados, solo visible cuando showAddModal es true */}
      <AddWithdrawAccountModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        form={addHook}
      />
    </>
  );
};

export default PaymentPreferences;
