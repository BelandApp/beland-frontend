import {
  Button,
  Card,
  CustomInput,
  CustomLoader,
  ThemedHeader,
  useThemedTabs,
  WrapperModal,
} from "src/components";
import { useFinanceAdmin } from "./hooks/useFinanceAdmin";
import { View, Text, Dimensions } from "react-native";
import { Image } from "react-native";
import PaymentTransferTab from "./components/financial/PaymentTransfer.tab";
import WithdrawTab from "./components/financial/Withdraw.tab";
import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";
import ConfigFinancialTab from "./components/financial/ConfigFinancialTab";
import { useFinanceAdminData } from "./hooks/useFinanceAdminData";
import { TypeAccount, useFinanceAdminUI } from "./hooks/useFinanceAdminUI";
import { useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import { useCustomNavigation } from "src/hooks";
import CustomPicker from "src/components/shared/input/Custom.picker";
const FinancesManagement: React.FC = () => {
  const financeData = useFinanceAdminData();
  const financeUI = useFinanceAdminUI({
    refreshWithdraws: financeData.refreshWithdraws,
    refreshTransfers: financeData.refreshTransfers,
    refreshAccounts: financeData.refreshAccounts,
  });
  const { navigate } = useCustomNavigation();
  const { tabs, onTabChange, activeTab } = useThemedTabs([
    "Transferencias",
    "Retiros",
    "Cuentas Bancarias",
  ]);

  /**
   * Lazy loading por tab
   */
  useEffect(() => {
    if (activeTab === "Retiros") {
      financeData.loadWithdraws();
    }

    if (activeTab === "Transferencias") {
      financeData.loadTransfers();
    }

    if (activeTab === "Cuentas Bancarias") {
      financeData.loadAccounts();
    }
  }, [activeTab]);

  const loading =
    financeData.loadingWithdraws ||
    financeData.loadingTransfers ||
    financeData.loadingAccounts;

  if (
    loading &&
    !financeData.withdraws &&
    !financeData.transfers &&
    !financeData.accounts
  ) {
    return (
      <>
        <ThemedHeader canGoBack title="Finanzas" />
        <CustomLoader />
      </>
    );
  }
  return (
    <>
      <ThemedHeader
        canGoBack
        title="Finanzas"
        onBackPress={() => navigate("UserDashboardScreen")}
      />

      <View className="px-6 pt-1">
        <ThemedTabs tabs={tabs} onTabChange={onTabChange} />

        {activeTab === "Retiros" && financeData.withdraws && (
          <WithdrawTab
            data={financeData.withdraws}
            handleOpen={financeUI.handleOpen}
          />
        )}

        {activeTab === "Transferencias" && financeData.transfers && (
          <PaymentTransferTab
            data={financeData.transfers}
            handleOpen={financeUI.handleOpen}
          />
        )}

        {activeTab === "Cuentas Bancarias" && financeData.accounts && (
          <ConfigFinancialTab
            data={financeData.accounts}
            handleOpen={financeUI.handleOpen}
            handleChangeStatusAccount={financeUI.handleChangeStatusAccount}
            loading={financeUI.loading}
          />
        )}
      </View>

      {/* Modal Imagen */}
      <WrapperModal
        header={<Text className="text-lg font-semibold">Comprobante</Text>}
        isOpen={financeUI.modal === "image"}
        onClose={financeUI.handleCancel}
        content={
          <Image
            style={{
              width: Dimensions.get("window").width,
              height: Dimensions.get("window").height * 0.7,
              resizeMode: "contain",
            }}
            source={{ uri: financeUI.image }}
          />
        }
      />

      {/* Modal Cuenta */}
      <WrapperModal
        header={<Text className="text-lg font-semibold">Nueva Cuenta</Text>}
        isOpen={financeUI.modal === "account"}
        onClose={financeUI.handleCancel}
        content={
          <View className="grid md:grid-cols-2 gap-2">
            <CustomInput
              variant="filled"
              label="Banco"
              onChangeText={financeUI.setBanco}
              value={financeUI.bank}
              required
            />
            <CustomPicker
              label="Seleccionar tipo de cuenta"
              value={financeUI.type_account}
              onChange={(value) =>
                financeUI.setAccountType(value as TypeAccount)
              }
              required
              options={[
                { label: "Seleccionar tipo de cuenta", value: null },
                { label: "Caja de ahorro", value: "AHORRO" },
                { label: "Cuenta corriente", value: "CORRIENTE" },
              ]}
            />
            <View
              style={{
                height: 40,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                borderRadius: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                overflow: "hidden",
              }}
            >
              <Picker
                selectedValue={financeUI.type_account}
                mode="dropdown"
                onValueChange={financeUI.setAccountType}
                dropdownIconColor="#000"
                style={{
                  flex: 1,
                  height: 40,
                }}
              >
                <Picker.Item label="Seleccionar tipo de cuenta" value={null} />
                <Picker.Item label="Caja de ahorro" value="AHORRO" />
                <Picker.Item label="Cuenta corriente" value="CORRIENTE" />
              </Picker>
              {financeUI.type_account === null && (
                <Text className="text-lg self-start text-red-500 p-1">*</Text>
              )}
            </View>
            <CustomInput
              variant="filled"
              label="Nombre del titular bancario"
              onChangeText={financeUI.setAccountHolder}
              value={financeUI.accountHolder}
              required
            />
            <CustomInput
              variant="filled"
              label="Nombre identificador"
              onChangeText={financeUI.setName}
              value={financeUI.name}
              required
            />
            <CustomInput
              variant="filled"
              label="Nro cuenta bancaria"
              onChangeText={financeUI.setAccountNumber}
              value={financeUI.nro_account}
              required
            />
            <CustomInput
              variant="filled"
              label="Email de referencia"
              onChangeText={financeUI.setEmail}
              value={financeUI.email}
              required
            />
            <CustomInput
              variant="filled"
              label="Ruc"
              onChangeText={financeUI.setRuc}
              value={financeUI.ruc}
            />
            <CustomInput
              variant="filled"
              label="CBU"
              onChangeText={financeUI.setCbu}
              value={financeUI.cbu}
            />
            <CustomInput
              variant="filled"
              label="Alias"
              onChangeText={financeUI.setAlias}
              value={financeUI.alias}
            />
          </View>
        }
        actions={
          <View className="flex flex-row justify-center gap-6">
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={financeUI.handleCancel}
              disabled={financeUI.loading}
            />
            <Button
              title="Confirmar"
              onPress={financeUI.handleConfirm}
              disabled={financeUI.loading}
            />
          </View>
        }
      />

      {/* Modal Transferencia */}
      <WrapperModal
        isOpen={financeUI.modal === "recharge"}
        onClose={financeUI.handleCancel}
        header={
          <Text className="text-lg font-semibold capitalize">
            {financeUI.typeAction} Transacción
          </Text>
        }
        actions={
          <View className="flex flex-row justify-center gap-6">
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={financeUI.handleCancel}
              disabled={financeUI.loading}
            />
            <Button
              title="Confirmar"
              onPress={financeUI.handleConfirm}
              disabled={financeUI.loading}
            />
          </View>
        }
        content={
          <View>
            <CustomInput
              variant="filled"
              label="Nro Transaccion bancaria"
              onChangeText={financeUI.setReference}
              value={financeUI.reference}
            />
            <CustomInput
              variant="filled"
              label="Observaciones (Opcional)"
              onChangeText={financeUI.setObservation}
              value={financeUI.observation}
            />
          </View>
        }
      />

      {/* Modal Retiro */}
      <WrapperModal
        isOpen={financeUI.modal === "withdraw"}
        onClose={financeUI.handleCancel}
        header={
          <Text className="text-lg font-semibold capitalize">
            {financeUI.typeAction} Retiro
          </Text>
        }
        actions={
          <View className="flex flex-row justify-center gap-6">
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={financeUI.handleCancel}
              disabled={financeUI.loading}
            />
            <Button
              title="Confirmar"
              onPress={financeUI.handleConfirm}
              disabled={financeUI.loading}
            />
          </View>
        }
        content={
          <View>
            <CustomInput
              variant="filled"
              label="Nro retiro bancaria"
              onChangeText={financeUI.setReference}
              value={financeUI.reference}
            />
            <CustomInput
              variant="filled"
              label="Observaciones (Opcional)"
              onChangeText={financeUI.setObservation}
              value={financeUI.observation}
            />
          </View>
        }
      />
    </>
  );
};

export default FinancesManagement;
