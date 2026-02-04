import {
  Button,
  Card,
  CustomInput,
  CustomLoader,
  ThemedHeader,
  WrapperModal,
} from "src/components";
import { useFinanceAdmin } from "./hooks/useFinanceAdmin";
import { View, Text } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { UserWithdraw, WithdrawAccount } from "src/services/withdrawService";
const getStatusColor = (status: string) => {
  switch (status) {
    case "Completada":
      return "#4caf50";
    case "Pendiente":
      return "#ff9800";
    case "Fallida":
      return "#f44336";
    default:
      return "#666";
  }
};
const FinancesManagement: React.FC = () => {
  const {
    withDraw,
    loading,
    modalOpen,
    handleOpen,
    setReference,
    reference,
    setObservation,
    observation,
    handleCancel,
    PutWithdraw,
  } = useFinanceAdmin();

  const renderItem = ({ item }: { item: UserWithdraw }) => (
    <Card
      key={item.id}
      children={
        <View className="px-2">
          <View className="grid grid-cols-2 items-center mb-2">
            <Text className="text-lg font-semibold">
              Retiro a cuenta bancaria
            </Text>
            <View className="flex flex-col items-start">
              <View className="flex flex-row gap-1">
                <Text>Status:</Text>
                <Text
                  style={{
                    color: getStatusColor(item.status.name),
                    fontWeight: 500,
                  }}
                >
                  {item.status.name}
                </Text>
              </View>
              {item.status.name != "Pendiente" && (
                <Text>
                  Fecha: {new Date(item.status.updated_at).toUTCString()}
                </Text>
              )}
            </View>
          </View>
          <View className="grid md:grid-cols-2 grid-cols-1">
            <Text>Usuario: {item.user.full_name}</Text>
            <Text>DNI: {item.withdraw_account.holderDocument}</Text>
            <Text>Monto: USD$ {item.amount_usd}</Text>
            <Text>País: {item.withdraw_account.country}</Text>
            <Text>Banco: {item.withdraw_account.bankName}</Text>
            <Text>Cuenta Nro: {item.withdraw_account.accountNumber}</Text>
            <Text>
              Cuenta tipo: {item.withdraw_account.withdraw_account_type.name}
            </Text>
            <Text>Observación: {item.observation}</Text>
            {item.status.name === "Completada" && (
              <Text>Referencia Bancaria: {item.transaction_banck_id}</Text>
            )}
          </View>
          {item.status.name === "Pendiente" && (
            <View className="flex flex-row justify-center gap-8 mt-2 pt-2 border-t border-t-slate-400">
              <Button
                title="Rechazar"
                variant="secondary"
                onPress={() => handleOpen(item.id, "reject")}
              />
              <Button
                title="Aprobar"
                onPress={() => handleOpen(item.id, "approve")}
              />
            </View>
          )}
        </View>
      }
    />
  );
  if (loading) {
    return (
      <>
        {" "}
        <ThemedHeader canGoBack title="Finanzas" />
        <CustomLoader />
      </>
    );
  }

  return (
    <>
      <ThemedHeader canGoBack title="Finanzas" />
      <FlatList
        data={withDraw}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        bounces={true}
        ListEmptyComponent={
          <View className="text-center">
            <Text className="font-semibold text-xl">No hay transacciones</Text>
          </View>
        }
      />
      <WrapperModal
        isOpen={modalOpen}
        onClose={handleCancel}
        header={<Text className="text-lg font-semibold">Confirmar acción</Text>}
        actions={
          <View className="flex flex-row justify-center gap-6">
            <Button title="Cancelar" onPress={handleCancel} />
            <Button title="Confirmar" onPress={PutWithdraw} />
          </View>
        }
        content={
          <View>
            <CustomInput
              variant="filled"
              label="Nro Transaccion bancaria"
              onChangeText={setReference}
              value={reference}
            />
            <CustomInput
              variant="filled"
              label="Observaciones (Opcional)"
              onChangeText={setObservation}
              value={observation}
            />
          </View>
        }
      />
    </>
  );
};

export default FinancesManagement;
