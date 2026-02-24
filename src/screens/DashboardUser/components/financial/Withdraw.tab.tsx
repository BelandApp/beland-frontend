import React from "react";
import { FlatList, Text, View } from "react-native";
import { Button, Card } from "src/components";
import { UserRecharge, UserWithdraw } from "@/services";
import { contactUser } from "src/utils/contactLink";
import { getStatusColor } from "./PaymentTransfer.tab";
import { HandleOpenFinancial } from "../../hooks/useFinanceAdmin";
type WithdrawTabProps = {
  data: any;
  handleOpen: ({ id, action, entity }: HandleOpenFinancial) => void;
};
const WithdrawTab: React.FC<WithdrawTabProps> = ({ data, handleOpen }) => {
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
                  onPress={() =>
                    handleOpen({
                      id: item.id,
                      action: "reject",
                      entity: "withdraw",
                    })
                  }
                />
                <Button
                  title="Aprobar"
                  onPress={() =>
                    handleOpen({
                      id: item.id,
                      action: "approve",
                      entity: "withdraw",
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
      <Text className="text-xl font-semibold">Retiros Bancarios</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={WithDrawItem}
        showsVerticalScrollIndicator={false}
        bounces={true}
        ListEmptyComponent={
          <View className="text-center">
            <Text className="font-semibold text-xl mx-auto">
              No hay Retiros
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default WithdrawTab;
