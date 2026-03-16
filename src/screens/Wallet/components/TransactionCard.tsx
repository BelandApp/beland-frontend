import React from "react";
import { View, Text } from "react-native";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Transaction } from "../types";
import { Card } from "../../../components/ui/Card";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { User } from "src/context";
import { DateToParagraphAndHour } from "src/utils/dateTransform";
import { convertBeCoinsToUSD } from "src/constants";
import { position } from "html2canvas/dist/types/css/property-descriptors/position";
import {
  borderBottomLeftRadius,
  borderTopRightRadius,
} from "html2canvas/dist/types/css/property-descriptors/border-radius";
import { CheckCircle, Watch } from "lucide-react-native";

interface TransactionCardProps {
  transaction: Transaction;
}
export const getAmountPrefix = (type: Transaction["type"]) => {
  const { code } = type;

  // 1. Códigos que siempre restan, sin importar el usuario
  const globalNegatives = [
    "DONATION_SEND",
    "PURCHASE_EVENTPASS",
    "PURCHASE_BELAND",
    "SERVICE_BELAND",
  ];
  if (globalNegatives.includes(code)) return "-";

  return "+";
};
export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
}) => {
  return (
    <Card style={styles.container}>
      {/* badge */}
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: transaction.status.color },
        ]}
      >
        {transaction.status.code === "COMPLETED" && (
          <CheckCircle size={12} color={"white"} />
        )}
        {transaction.status.code === "PENDING" && (
          <Watch size={12} color={"white"} />
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View
            style={[styles.iconContainer]}
            className="shadow-beland-orange-300 shadow"
          >
            <MaterialCommunityIcons
              name={transaction.type.icon as any}
              color={transaction.type.color}
              size={24}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.description} numberOfLines={1}>
              {transaction.type.name}
            </Text>
            <Text style={styles.date}>
              {DateToParagraphAndHour(transaction.created_at)}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: transaction.type.color }]}>
              {getAmountPrefix(transaction.type)} $
              {convertBeCoinsToUSD(transaction.amount_becoin).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = {
  container: {
    marginBottom: 8,
    position: "relative" as const,
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
    justifyContent: "center" as const,
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
    width: 40,
    height: 20,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    position: "absolute" as const,
    top: -20,
    right: -20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
};
