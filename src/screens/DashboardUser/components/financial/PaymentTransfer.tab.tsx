import React from "react";
import { FlatList, Text, View } from "react-native";
import { Button, Card } from "src/components";
import { UserRecharge, UserWithdraw } from "@/services";
import { contactUser } from "src/utils/contactLink";
import { HandleOpenFinancial } from "../../hooks/useFinanceAdmin";
export const getStatusColor = (status: string) => {
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

type TransferTabProps = {
  data: any;
  handleOpen: ({ id, action, entity }: HandleOpenFinancial) => void;
};
const PaymentTransferTab: React.FC<TransferTabProps> = ({
  data,
  handleOpen,
}) => {
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
                  handleOpen({
                    id: "",
                    action: "approve",
                    entity: "image",
                    uri: item.ticket_image_url,
                  });
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
                  onPress={() =>
                    handleOpen({
                      id: item.id,
                      action: "reject",
                      entity: "recharge",
                    })
                  }
                />
                <Button
                  title="Acreditar Becoins"
                  onPress={() =>
                    handleOpen({
                      id: item.id,
                      action: "approve",
                      entity: "recharge",
                    })
                  }
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

  return (
    <View>
      <Text className="text-xl font-semibold">Ingresos Bancarios</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={TransferItem}
        showsVerticalScrollIndicator={false}
        bounces={true}
        ListEmptyComponent={
          <View className="text-center">
            <Text className="font-semibold text-xl mx-auto">
              No hay Transferencias
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default PaymentTransferTab;
