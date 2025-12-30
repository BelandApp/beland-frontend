import { View, Text } from "react-native";
import { Transaction } from "../types";
import { getAmountPrefix } from "../components/TransactionCard";
import { convertBeCoinsToUSD } from "src/constants";
import { forwardRef } from "react";
import { InfoItems } from "../hooks/useTransactionInfo";
type Props = {
  transaction: Transaction;
  info: InfoItems[] | null;
};
export const TransactionReceipt = forwardRef<View, Props>(
  ({ transaction, info }, ref) => {
  return (
    <View
      ref={ref}
      collapsable={false}
      className="bg-white p-6 rounded-2xl w-[320px]"
    >
      <Text className="text-lg font-semibold text-center">
        Comprobante de transacción
      </Text>

      <Text className="text-sm text-gray-500 text-center mt-1">
        {transaction.date}
      </Text>

      <View className="items-center mt-4">
        <Text className="text-3xl font-bold">
          {getAmountPrefix(transaction.type)}
          {transaction.amount_becoin} Becoin
        </Text>
        <Text className="text-sm text-gray-500">
          ≈ USD {convertBeCoinsToUSD(transaction.amount_beicon).toFixed(2)}
        </Text>
      </View>

      <View className="mt-4 gap-2">
        <Text>Descripción: {transaction.description}</Text>
       
          {info?.map((item, index) => (
            <Text key={index} className="text-base">
              {item.cantidad} × {item.producto}
            </Text>
          ))}
        <Text>Estado: {transaction.status}</Text>
        <Text>ID: {transaction.id}</Text>
      </View>
    </View>
  );
});

export default TransactionReceipt;