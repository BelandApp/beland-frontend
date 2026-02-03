import { Button, Card, CustomLoader, ThemedHeader } from "src/components";
import { useFinanceAdmin } from "./hooks/useFinanceAdmin";
import { View, Text } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { UserWithdraw, WithdrawAccount } from "src/services/withdrawService";

const FinancesManagement: React.FC = () => {
  const { withDraw, loading } = useFinanceAdmin();
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
    </>
  );
};

export default FinancesManagement;

const renderItem = ({ item }: { item: UserWithdraw }) => (
  <Card
    key={item.id}
    children={
      <View className="px-2">
        <View className="grid grid-cols-2 items-center mb-2">
          <Text className="text-lg font-semibold">
            Retiro a cuenta bancaria
          </Text>
          <View className="flex flex-row gap-1">
            <Text>Status:</Text>
            <Text className="text-orange-500 font-semibold">
              {item.status.name}
            </Text>
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
        </View>
        <View className="flex flex-row justify-center gap-8 mt-2 pt-2 border-t border-t-slate-400">
          <Button title="Rechazar" variant="secondary" onPress={() => {}} />
          <Button title="Aprobar" onPress={() => {}} />
        </View>
      </View>
    }
  />
);
