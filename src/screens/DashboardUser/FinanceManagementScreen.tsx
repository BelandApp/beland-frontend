import {
  Button,
  Card,
  CustomInput,
  CustomLoader,
  ThemedHeader,
  WrapperModal,
} from "src/components";
import { useFinanceAdmin } from "./hooks/useFinanceAdmin";
import { View, Text, Dimensions } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { UserRecharge, UserWithdraw } from "@/services";
import { contactUser } from "src/utils/contactLink";
import { Image } from "react-native";
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
    paymentsTransfer,
    loading,
    modalOpen,
    handleOpen,
    setReference,
    reference,
    setObservation,
    observation,
    handleCancel,
    handleConfirm,
    imageModal,
    closeImage,
    image,
    openImage,
  } = useFinanceAdmin();

  const WithDrawItem = ({ item }: { item: UserWithdraw }) => (
    <Card
      key={item.id}
      children={
        <View className="px-2">
          <View className="grid md:grid-cols-2 items-center mb-2">
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
          <View className="grid md:grid-cols-2 grid-cols-1 border-t border-t-slate-400 pt-2">
            <Text>Fecha de solicitud: {item.created_at}</Text>
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
          <View className="flex flex-row justify-center gap-8">
            {item.status.name === "Pendiente" && (
              <View className="flex flex-row justify-center gap-8 mt-2 pt-2 border-t border-t-slate-400 w-full">
                <Button
                  title="Rechazar"
                  variant="secondary"
                  onPress={() => handleOpen(item.id, "reject", "withdraw")}
                />
                <Button
                  title="Aprobar"
                  onPress={() => handleOpen(item.id, "approve", "withdraw")}
                />
              </View>
            )}
            {item.status.name === "Fallida" && (
              <View className="flex flex-row justify-center gap-8 mt-2 pt-2 border-t border-t-slate-400 w-full">
                <Button
                  title="Contactar"
                  onPress={() =>
                    contactUser({
                      phone: item.user.phone,
                      mail: item.user.email,
                    })
                  }
                />
              </View>
            )}
          </View>
        </View>
      }
    />
  );
  const TransferItem = ({ item }: { item: UserRecharge }) => (
    <Card
      key={item.id}
      children={
        <View className="px-2">
          <View className="grid md:grid-cols-2 items-center mb-2">
            <Text className="text-lg font-semibold">
              Transferencia Recibida
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
          <View className="grid md:grid-cols-2 grid-cols-1 border-t border-t-slate-400 pt-2">
            <Text>Fecha de solicitud: {item.created_at}</Text>
            <Text>Usuario: {item.user.full_name}</Text>

            <Text>Monto: USD$ {item.amount_usd}</Text>
            <Text>País: {item.user.country ?? "Sin datos"}</Text>
            <Text>Banco receptor: {item.paymentAccount.bank} </Text>
            <Text>Cuenta Receptora Nro:{item.paymentAccount.nro_account} </Text>
            <Text>
              Cuenta Receptora tipo: {item.paymentAccount.type_account}
            </Text>
            <Text>Observación: {item.observation}</Text>
            <Text>Referencia Bancaria: {item.transfer_id}</Text>
            {item.ticket_image_url && (
              <Button
                title="Ver comprobante"
                variant="inline"
                onPress={() => {
                  openImage(item.ticket_image_url);
                }}
              />
            )}
          </View>
          <View className="flex flex-row justify-center gap-8">
            {item.status.name === "Pendiente" && (
              <View className="flex flex-row justify-center gap-8 mt-2 pt-2 border-t border-t-slate-400 w-full">
                <Button
                  title="Rechazar"
                  variant="secondary"
                  onPress={() => handleOpen(item.id, "reject", "recharge")}
                />
                <Button
                  title="Acreditar Becoins"
                  onPress={() => handleOpen(item.id, "approve", "recharge")}
                />
              </View>
            )}
            {item.status.name === "Fallida" && (
              <View className="flex flex-row justify-center gap-8 mt-2 pt-2 border-t border-t-slate-400 w-full">
                <Button
                  title="Contactar"
                  onPress={() =>
                    contactUser({
                      phone: item.user.phone,
                      mail: item.user.email,
                    })
                  }
                />
              </View>
            )}
          </View>
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
      <Text className="text-xl mx-auto mt-1">Ingresos Bancarios</Text>
      <FlatList
        data={paymentsTransfer}
        keyExtractor={(item) => item.id}
        renderItem={TransferItem}
        showsVerticalScrollIndicator={false}
        bounces={true}
        ListEmptyComponent={
          <View className="text-center">
            <Text className="font-semibold text-xl">No hay Transferencias</Text>
          </View>
        }
      />
      <Text className="text-xl mx-auto ">Retiros Bancarios</Text>
      <FlatList
        data={withDraw}
        keyExtractor={(item) => item.id}
        renderItem={WithDrawItem}
        showsVerticalScrollIndicator={false}
        bounces={true}
        ListEmptyComponent={
          <View className="text-center">
            <Text className="font-semibold text-xl">No hay Retiros</Text>
          </View>
        }
      />
      <WrapperModal
        key="modal2"
        header={<Text className="text-lg font-semibold">Comprobante</Text>}
        isOpen={imageModal}
        onClose={closeImage}
        content={
          <Image
            style={{
              width: Dimensions.get("window").width,
              height: Dimensions.get("window").height * 0.7,
              resizeMode: "contain",
            }}
            source={{ uri: image }}
          />
        }
      />
      <WrapperModal
        key="modal1"
        isOpen={modalOpen}
        onClose={handleCancel}
        header={<Text className="text-lg font-semibold">Confirmar acción</Text>}
        actions={
          <View className="flex flex-row justify-center gap-6">
            <Button title="Cancelar" onPress={handleCancel} />
            <Button title="Confirmar" onPress={handleConfirm} />
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
