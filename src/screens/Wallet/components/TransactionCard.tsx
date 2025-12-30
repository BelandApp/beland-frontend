import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Transaction } from "../types";
import { Card } from "../../../components/ui/Card";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";

interface TransactionCardProps {
  transaction: Transaction;
}
export const getTransactionIcon = (type: Transaction["type"]) => {
  // Si es transferencia recibida, mostrar icono de entrada
  if (type === "receive") return "arrow-down-left";
  if (type === "transferencia") return "arrow-up-right";
  if (type === "recarga") return "plus-circle";
  if (type === "canje") return "swap-horizontal";
  if (type === "pago") return "credit-card-minus";
  if (type === "collection") return "cash-plus";
  return "help-circle";
};
export const getTransactionColor = (type: Transaction["type"]) => {
  // Si es transferencia recibida, mostrar verde
  if (type === "receive" || type === "collection")
    return "#4caf50";
  if (type === "transferencia" || type === "pago")
    return "#f44336";
  if (type === "recarga") return "#2196f3";
  if (type === "canje") return "#ff9800";
  return "#666";
};

export const getAmountPrefix = (type: Transaction["type"]) => {
  // Si es transferencia recibida, mostrar '+'
  if (
    type === "receive" ||
    type === "collection" ||
    type === "recarga"
  )
    return "+";
  if (type === "transferencia" || type === "pago")
    return "-";
  return "";
};

 export const getStatusColor = (status: Transaction["status"]) => {
   switch (status) {
     case "exitoso":
       return "#4caf50";
     case "pendiente":
       return "#ff9800";
     case "error":
       return "#f44336";
     default:
       return "#666";
   }
 };
export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
}) => {

  

  

 

  // Forzar monto positivo para transferencias recibidas y usar el campo preferido
  const resolvedAmount =
    transaction.amount_becoin !== undefined
      ? Number(transaction.amount_becoin)
      : transaction.amount_beicon !== undefined
      ? Number(transaction.amount_beicon)
      : Number(transaction.amount || 0);

  const displayAmount =
    transaction.type === "receive" || transaction.type === "collection"
      ? Math.abs(resolvedAmount)
      : resolvedAmount;

  return (
    <Card style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${getTransactionColor(transaction.type)}20` },
            ]}
          >
            <MaterialCommunityIcons
              name={getTransactionIcon(transaction.type) as any}
              size={20}
              color={getTransactionColor(transaction.type)}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.description} numberOfLines={1}>
              {transaction.description}
            </Text>
            <Text style={styles.date}>{transaction.date}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.amountContainer}>
            <BeCoinIcon width={16} height={16} />
            <Text
              style={[
                styles.amount,
                { color: getTransactionColor(transaction.type) },
              ]}
            >
              {getAmountPrefix(transaction.type)}
              {String(Math.abs(displayAmount))}
            </Text>
          </View>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(transaction.status) },
            ]}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = {
  container: {
    marginBottom: 8,
    padding: 12,
  },
  content: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  leftSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  rightSection: {
    alignItems: "flex-end" as const,
  },
  amountContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginLeft: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
};
