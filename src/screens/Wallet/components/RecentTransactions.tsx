import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TransactionCard } from "./TransactionCard";
import { Transaction } from "../types";
import { recentTransactionsStyles } from "../styles";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import TransactionModal from "../modal/transaction.modal";

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  isLoading = false,
}) => {
  const { navigate } = useCustomNavigation();
  const [modalTransaction, setModalOpen] = useState<Transaction | null>(null);
  const handleViewAll = () => {
    navigate("WalletHistoryScreen");
  };
  const openModal = (transaction: Transaction) => {
    setModalOpen(transaction);
  };

  if (isLoading) {
    return (
      <View style={recentTransactionsStyles.container}>
        <View style={recentTransactionsStyles.header}>
          <Text style={recentTransactionsStyles.title}>
            Transacciones recientes
          </Text>
        </View>
        <View style={recentTransactionsStyles.loadingContainer}>
          <ActivityIndicator size="small" color="#F88D2A" />
          <Text style={recentTransactionsStyles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={recentTransactionsStyles.container}>
      <View style={recentTransactionsStyles.header}>
        <Text style={recentTransactionsStyles.title}>
          Transacciones recientes
        </Text>
        <TouchableOpacity
          onPress={handleViewAll}
          style={recentTransactionsStyles.viewAllButton}
        >
          <Text style={recentTransactionsStyles.viewAllText}>Ver todo</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color="#F88D2A"
          />
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <View style={recentTransactionsStyles.emptyContainer}>
          <MaterialCommunityIcons name="receipt" size={48} color="#ccc" />
          <Text style={recentTransactionsStyles.emptyTitle}>
            Sin transacciones
          </Text>
          <Text style={recentTransactionsStyles.emptyText}>
            Cuando realices transacciones aparecerán aquí
          </Text>
        </View>
      ) : (
        <View style={recentTransactionsStyles.transactionsList}>
          {transactions.slice(0, 3).map((transaction) => (
            <Pressable
              onPress={() => openModal(transaction)}
              key={transaction.id}
            >
              <TransactionCard transaction={transaction} />
            </Pressable>
          ))}
        </View>
      )}
      {modalTransaction !== null && (
        <TransactionModal
          transaction={modalTransaction}
          onClose={() => setModalOpen(null)}
        />
      )}
    </View>
  );
};
