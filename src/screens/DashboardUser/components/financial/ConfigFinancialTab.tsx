import { View, Text, FlatList } from "react-native";
import React from "react";
import { BackendPaymentAccount, PaymentAccount } from "src/services";
import { HandleOpenFinancial } from "../../hooks/useFinanceAdmin";
import { Button, Card } from "src/components";
type ConfigTabProps = {
  data: any;
  handleOpen: ({ id, action, entity }: HandleOpenFinancial) => void;
  handleChangeStatusAccount: (id: string, status: boolean) => void;
  loading: boolean;
};
const ConfigFinancialTab: React.FC<ConfigTabProps> = ({
  data,
  handleOpen,
  handleChangeStatusAccount,
  loading,
}) => {
  const AccountItem = ({ item }: { item: BackendPaymentAccount }) => (
    <Card
      key={item.id}
      children={
        <View className="px-2">
          <Text className="text-lg font-semibold">Cuenta Bancaria</Text>
          <View className="grid md:grid-cols-2 grid-cols-1 border-t border-t-slate-400 pt-2">
            <Text>Banco: {item.bank}</Text>
            <Text>Tipo de cuenta: {item.type_account}</Text>
            <Text>Cuenta Nro: {item.nro_account}</Text>
            {item.alias && <Text>Alias: {item.alias}</Text>}
            <Text>Email asociado: {item.email}</Text>
            <Text>Estado: {item.is_active ? "Activa" : "Suspendida"}</Text>
          </View>
          <View className="flex flex-row justify-center gap-8">
            <View className="flex flex-row justify-center gap-8 mt-2 pt-2 border-t border-t-slate-400 w-full">
              <Button
                disabled={loading}
                title={item.is_active ? "Suspender" : "Activar"}
                onPress={() =>
                  handleChangeStatusAccount(item.id, item.is_active)
                }
              />
              <Button
                disabled={loading}
                title="Modificar"
                onPress={() =>
                  handleOpen({
                    id: item.id,
                    action: "modify",
                    entity: "account",
                    account: item,
                  })
                }
              />
              <Button
                disabled={loading}
                title="Eliminar"
                variant="secondary"
                className="bg-red-500"
                onPress={() =>
                  handleOpen({
                    id: item.id,
                    action: "delete",
                    entity: "account",
                  })
                }
              />
            </View>
          </View>
        </View>
      }
    />
  );
  return (
    <View>
      <View className="items-center justify-between flex-row w-full">
        <Text className="text-xl font-semibold">Cuentas Bancarias</Text>
        <Button
          title="Agregar"
          className="ml-auto"
          onPress={() =>
            handleOpen({
              id: "1",
              action: "create",
              entity: "account",
            })
          }
        />
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={AccountItem}
        showsVerticalScrollIndicator={false}
        bounces={true}
        ListEmptyComponent={
          <View className="text-center">
            <Text className="font-semibold text-xl mx-auto">
              No hay Cuentas Bancarias
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default ConfigFinancialTab;
