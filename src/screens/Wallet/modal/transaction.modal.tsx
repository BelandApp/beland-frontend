import { Button, WrapperModal } from "src/components";
import { Transaction } from "../types";
import { View, Text, Pressable, Platform } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SquareChevronDown } from "lucide-react-native";
import { convertBeCoinsToUSD } from "src/constants";
import { getAmountPrefix } from "../components/TransactionCard";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useTransactionInfo } from "../hooks/useTransactionInfo";
import TransactionReceipt from "../shot/TransactionReceipt";
import { useRef } from "react";
import { useAuth } from "src/context";
import { formatTransactionDate } from "src/utils/dateTransform";
type TransactionModalProps = {
  transaction: Transaction | null;
  onClose: () => void;
};
const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
}) => {
  const receiptRef = useRef<View>(null);
  if (!transaction) return null;
  const { info } = useTransactionInfo(transaction);
  const shareReceipt = async () => {
    try {
      const node = receiptRef.current;
      if (!node) return;

      if (Platform.OS === "web") {
        // IMPORTACIÓN DINÁMICA PARA WEB
        const html2canvas = (await import("html2canvas")).default;

        // En Web, el ref de React Native suele ser el elemento DOM directo
        // o contiene una propiedad 'element'
        const element =
          (node as any).className !== undefined ? node : (node as any).element;

        const canvas = await html2canvas(element as HTMLElement, {
          useCORS: true,
          backgroundColor: null,
          scale: 2, // Mejor calidad
        });

        const uri = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = uri;
        link.download = `comprobante-${transaction.id}.png`;
        link.click();
      } else {
        // LÓGICA PARA NATIVO (iOS/Android)
        const uri = await captureRef(receiptRef, {
          format: "png",
          quality: 1,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch (error) {
      console.error("Error al capturar recibo:", error);
    }
  };

  return (
    <>
      <WrapperModal
        isOpen={transaction !== null}
        onClose={onClose}
        headerBackgroundColor={transaction.type.color}
        header={
          <View className="flex-row items-center justify-between px-2 py-3">
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <MaterialCommunityIcons
                  name={transaction.type.icon as any}
                  size={22}
                  color={transaction.type.color}
                />
              </View>
              <Text
                className="text-lg font-semibold capitalize"
                style={{ color: transaction.type.color }}
              >
                {transaction.type.description}
              </Text>
            </View>

            <Pressable onPress={onClose} hitSlop={10}>
              <SquareChevronDown color="white" size={26} />
            </Pressable>
          </View>
        }
        content={
          <View className="rounded-t-xl px-4 gap-3">
            <View className="items-center mt-3 gap-1">
              <View
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: transaction.status.color,
                }}
              >
                <Text
                  className="text-sm font-medium capitalize"
                  style={{ color: transaction.status.color }}
                >
                  {transaction.status.name}
                </Text>
              </View>

              <Text className="text-xs text-gray-500">
                {formatTransactionDate(transaction.created_at)}
              </Text>
            </View>
            <View className="mt-4 rounded-xl bg-gray-50 px-4 py-3 gap-2">
              {transaction.type.name === "transferencia" && (
                <>
                  <Text className="text-sm text-gray-500">Transferencia</Text>
                  <Text className="text-base">De: {transaction.from}</Text>
                  <Text className="text-base">Hacia: {transaction.to}</Text>
                </>
              )}

              {transaction.type.name === "SALE_BELAND" && (
                <>
                  <Text className="text-sm text-gray-500 mb-1">
                    Detalle de compra
                  </Text>
                  {info?.map((item, index) => (
                    <Text key={index} className="text-base">
                      {item.cantidad} × {item.producto}
                    </Text>
                  ))}
                </>
              )}
            </View>
            <View className="items-center mt-6 gap-1">
              <Text
                className="text-3xl font-bold"
                style={{ color: transaction.type.color }}
              >
                {getAmountPrefix(transaction.type)}
                {transaction.amount_becoin} Becoin
              </Text>

              <Text className="text-sm text-gray-500">
                ≈ USD{" "}
                {convertBeCoinsToUSD(transaction.amount_becoin).toFixed(2)}
              </Text>
            </View>
            <Text className="text-xs text-gray-400 text-center mt-4">
              ID: {transaction.id}
            </Text>
          </View>
        }
        actions={
          <View className="flex-row justify-center gap-8">
            <Button title="Ayuda" onPress={onClose} variant="ghost" />
            <Button
              title="Compartir"
              onPress={shareReceipt}
              variant="secondary"
            />
          </View>
        }
      />
      <View
        style={{
          position: "absolute",
          left: -5000,
          top: 0,
          zIndex: -1,
        }}
      >
        <TransactionReceipt
          ref={receiptRef}
          transaction={transaction}
          info={info}
        />
      </View>
    </>
  );
};

export default TransactionModal;
