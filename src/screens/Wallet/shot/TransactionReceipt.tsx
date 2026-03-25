import { View, Text } from "react-native";
import { Transaction } from "../types";
import { convertBeCoinsToUSD } from "src/constants";
import { forwardRef } from "react";
import { InfoItems } from "../hooks/useTransactionInfo";
import { colors } from "src/design-system";
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
          {transaction.created_at}
        </Text>

        <View className="items-center mt-4">
          <Text
            className="text-3xl font-bold"
            style={{
              color:
                Number(transaction.amount_becoin) > 0
                  ? colors.brand.green[500]
                  : colors.semantic.error[500],
            }}
          >
            {transaction.amount_becoin} Becoin
          </Text>
          <Text className="text-sm text-gray-500">
            ≈ USD {convertBeCoinsToUSD(transaction.amount_becoin).toFixed(2)}
          </Text>
        </View>

        {info && (
          <View className="mt-4 gap-2">
            <Text>Descripción: {transaction.type.description}</Text>

            {info?.map((item, index) => (
              <Text key={index} className="text-base">
                {item.cantidad} × {item.producto}
              </Text>
            ))}
            <Text>Estado: {transaction.status.name}</Text>
            <Text>ID: {transaction.id}</Text>
          </View>
        )}
      </View>
    );
  },
);

export default TransactionReceipt;
