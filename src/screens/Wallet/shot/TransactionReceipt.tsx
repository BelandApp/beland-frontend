import { View, Text } from "react-native";
import { Transaction } from "../types";
import { getAmountPrefix } from "../components/TransactionCard";
import { convertBeCoinsToUSD } from "src/constants";
import { forwardRef } from "react";
import { ProductItems } from "../hooks/useTransactionInfo";
import { Event } from "src/stores";
type Props = {
  transaction: Transaction;
  products: ProductItems[] | null;
  eventInfo: Event | null;
};
export const TransactionReceipt = forwardRef<View, Props>(
  ({ transaction, products, eventInfo }, ref) => {
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
          {transaction.created_at}
        </Text>

        <View className="items-center mt-4">
          <Text className="text-3xl font-bold">
            {getAmountPrefix(transaction.type)}
            {transaction.amount_becoin} Becoin
          </Text>
          <Text className="text-sm text-gray-500">
            ≈ USD {convertBeCoinsToUSD(transaction.amount_becoin).toFixed(2)}
          </Text>
        </View>

        <View className="mt-4 gap-2">
          <Text>Descripción: {transaction.type.description}</Text>

          {products?.map((item, index) => (
            <Text key={index} className="text-base">
              {item.cantidad} × {item.producto}
            </Text>
          ))}
          {eventInfo && (
            <Text className="text-center">
              Entrada para el Evento {eventInfo?.name}
            </Text>
          )}
          <Text
            style={{
              color:
                transaction.status.code === "COMPLETED" ? "green" : "orange",
            }}
          >
            Estado: {transaction.status.name}
          </Text>
          <Text>ID: {transaction.id}</Text>
        </View>
      </View>
    );
  },
);

export default TransactionReceipt;
