import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React from "react";
import { usePaymentPreferences } from "../hooks";
import { WithdrawAccount } from "src/services";
import { Building2, Plus, Trash } from "lucide-react-native";
import { Button, CustomInput, WrapperModal } from "src/components";
import { ModalsAccountType } from "../hooks/usePaymentPreferences";
import CustomPicker from "src/components/shared/input/Custom.picker";
import {
  AllowCountries,
  AllowCurrency,
  AllowDocuments,
  countriesOptions,
  currencyOptions,
  documentOptions,
} from "../hooks/useAddWithdrawAccount";

const WithdrawAccounts = () => {
  const {
    account,
    accounts,
    loading,
    openModal,
    handleDelete,
    modal,
    closeModal,
    handleChangeStatus,
    addHook,
  } = usePaymentPreferences();
  const renderAccountCard = ({ item }: { item: WithdrawAccount }) => (
    <TouchableOpacity
      onPress={() => openModal("detailAccount", item)}
      className="bg-white rounded-2xl shadow-md w-60 h-[170px] justify-between"
    >
      <View className="p-4 h-[150px] gap-3">
        <View className="flex-row items-center justify-between">
          <Building2 size={18} color="#666" />
          <View className="gap-1">
            <Text className="font-semibold">
              {item.withdraw_account_type.name}
            </Text>
            <Text className="capitalize">{item.bankName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            disabled={loading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="p-2 bg-white rounded-full shadow"
          >
            <Trash size={16} color="#e02424" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <Text className="my-auto">Cuenta Nro. {item.accountNumber}</Text>
        {item.alias && <Text>Alias {item.alias}</Text>}
        {item.cbu && <Text>CBU {item.cbu}</Text>}
      </View>
      <Text
        className={`self-end px-4 pr-6 text-white rounded-tl-2xl rounded-br-2xl ${item.is_active ? "bg-orange-500" : "bg-red-400"}`}
      >
        {item.is_active ? "Activa" : "Suspendida"}
      </Text>
    </TouchableOpacity>
  );
  const MODALS_CONTENT: Record<ModalsAccountType, React.ReactNode> = {
    addAccount: (
      <View className="grid md:grid-cols-2 gap-2">
        <CustomPicker
          label="Seleccione país"
          value={addHook.form.country}
          onChange={(value) =>
            addHook.setField("country", value as AllowCountries)
          }
          options={countriesOptions}
          required
        />
        <CustomInput
          variant="filled"
          label="Banco"
          value={addHook.form.bankName}
          onChangeText={(value) => addHook.setField("bankName", value)}
          required
        />
        {addHook.accountTypes && (
          <CustomPicker
            label="Seleccione tipo de cuenta"
            value={addHook.form.selectedType}
            onChange={(value) => addHook.setField("selectedType", value as any)}
            required
            options={addHook.accountTypeOptions}
          />
        )}
        <CustomInput
          variant="filled"
          label="Nro. de cuenta"
          required
          value={addHook.form.accountNumber}
          onChangeText={(value) => addHook.setField("accountNumber", value)}
        />
        <CustomInput
          variant="filled"
          label="Titular"
          required
          value={addHook.form.holderName}
          onChangeText={(value) => addHook.setField("holderName", value)}
        />
        <CustomPicker
          label="Seleccione tipo de documento"
          value={addHook.form.holderDocumentType}
          required
          onChange={(value) =>
            addHook.setField("holderDocumentType", value as AllowDocuments)
          }
          options={documentOptions}
        />
        <CustomInput
          variant="filled"
          required
          label={addHook.form.holderDocumentType ?? "RUC"}
          value={addHook.form.holderDocument}
          onChangeText={(value) => addHook.setField("holderDocument", value)}
        />
        <CustomPicker
          label="Seleccione moneda"
          value={addHook.form.currency}
          required
          onChange={(value) =>
            addHook.setField("currency", value as AllowCurrency)
          }
          options={currencyOptions}
        />
        {addHook.form.country === "ARGENTINA" && (
          <CustomInput
            variant="filled"
            label="Alias"
            value={addHook.form.alias}
            onChangeText={(value) => addHook.setField("alias", value)}
          />
        )}
        {addHook.form.country === "ARGENTINA" && (
          <CustomInput
            variant="filled"
            label="CBU"
            value={addHook.form.cbu}
            onChangeText={(value) => addHook.setField("cbu", value)}
          />
        )}
      </View>
    ),
    detailAccount: (
      <View className="p-4 gap-2">
        <View className="md:flex-row justify-between items-center">
          <Text className="text-2xl font-semibold">
            Cuenta Nro. {account?.accountNumber}
          </Text>
          <Text
            className={`text-xl text-white px-2 py-1 rounded-sm rounded-tl-2xl rounded-br-2xl  ${account?.is_active ? "bg-green-500" : "bg-red-500"}`}
          >
            {account?.is_active ? "Activa" : "Suspendida"}
          </Text>
        </View>
        <View className="gap-2 grid md:grid-cols-2">
          <Text className="text-lg">Banco: {account?.bankName}</Text>
          <Text className="text-lg">País: {account?.country}</Text>
          <Text className="text-lg">
            Tipo: {account?.withdraw_account_type.name}
          </Text>
          <Text className="text-lg">Titular: {account?.holderName}</Text>
          <Text className="text-lg">
            {account?.holderDocumentType}: {account?.holderDocument}
          </Text>
          <Text className="text-lg">Moneda: {account?.currency}</Text>
          <Text className="text-lg">Alias: {account?.alias ?? "No posee"}</Text>
          <Text className="text-lg">CBU: {account?.cbu ?? "No posee"}</Text>
        </View>
      </View>
    ),
    none: <></>,
  };
  const MODALS_ACTIONS: Record<ModalsAccountType, React.ReactNode> = {
    addAccount: (
      <View className="md:flex-row justify-between gap-2 mx-auto">
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={closeModal}
          disabled={loading}
        />
        <Button
          title="Agregar"
          onPress={addHook.handleSubmit}
          disabled={loading}
        />
      </View>
    ),
    detailAccount: (
      <View className="md:flex-row justify-between gap-2 mx-auto">
        <View className="md:flex-row justify-between gap-2">
          <Button
            disabled={loading}
            title={account?.is_active ? "Suspender" : "Activar"}
            onPress={handleChangeStatus}
          />
          <Button
            disabled={loading}
            title="Borrar"
            onPress={() => handleDelete("")}
            style={{ backgroundColor: "red" }}
          />
        </View>
      </View>
    ),
    none: <></>,
  };
  return (
    <View>
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-semibold text-gray-900">
          Cuentas de retiro
        </Text>
        <Button
          variant="onlyIcon"
          icon={<Plus size={18} color="#FF6B35" />}
          onPress={() => {
            openModal("addAccount");
          }}
          title="Nueva"
          style={{ borderColor: "transparent", backgroundColor: "#f3f4f6" }}
        />
      </View>
      <View className="flex-row gap-2">
        <FlatList
          horizontal
          data={accounts}
          renderItem={renderAccountCard}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2 p-4"
          ListFooterComponent={
            <TouchableOpacity
              className=" h-[170px] w-60 bg-white rounded-2xl shadow-md"
              onPress={() => openModal("addAccount")}
            >
              <View className="items-center gap-2 m-auto">
                <Plus size={20} color="gray" />
                <Text className="text-gray-500 font-semibold">
                  Agregar cuenta nueva
                </Text>
              </View>
            </TouchableOpacity>
          }
        />
      </View>
      {/* Modal */}
      <WrapperModal
        header={
          <View className="gap-2 flex-row">
            <Building2 />
            <Text className="text-xl font-semibold">
              {modal === "addAccount" ? "Añadir cuenta" : "Detalles de cuenta"}
            </Text>
          </View>
        }
        isOpen={modal != "none"}
        onClose={closeModal}
        content={MODALS_CONTENT[modal]}
        actions={MODALS_ACTIONS[modal]}
      />
    </View>
  );
};

export default WithdrawAccounts;
