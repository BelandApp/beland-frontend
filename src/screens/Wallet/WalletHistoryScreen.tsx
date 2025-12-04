import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TransactionCard } from "./components/TransactionCard";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { SearchBarInput, ThemedHeader } from "src/components";
import { useWallet } from "./hooks";

export default function WalletHistoryScreen() {
  const { goBack } = useCustomNavigation();
  const {transactions, loadingTransactions} = useWallet()
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filterOptions = [
    { id: "all", label: "Todas", icon: "format-list-bulleted" },
    { id: "transfer", label: "Enviados", icon: "arrow-up-right" },
    { id: "receive", label: "Recibidos", icon: "arrow-down-left" },
    { id: "recharge", label: "Recargas", icon: "plus-circle" },
    { id: "exchange", label: "Canjes", icon: "swap-horizontal" },
  ];

  const filteredTransactions = (transactions ?? []).filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesFilter =
      filterType === "all" || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleFilterPress = (type: string) => {
    setFilterType(type);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ThemedHeader canGoBack title="Historial de Transacciones" />

      {/* Search and Filters */}
      <View style={styles.searchAndFilters}>
        {/* Search Bar */}
        <SearchBarInput
          placeholder="Buscar transacciones..."
          onSearchChange={setSearchText}
          searchQuery={searchText}
        />
        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterButton,
                filterType === option.id && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterPress(option.id)}
            >
              <MaterialCommunityIcons
                name={option.icon as any}
                size={16}
                color={filterType === option.id ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === option.id && styles.filterButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.transactionsList}>
        {loadingTransactions ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F88D2A" />
            <Text style={styles.loadingText}>Cargando transacciones...</Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="receipt" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {searchText || filterType !== "all"
                ? "No se encontraron transacciones"
                : "Sin transacciones"}
            </Text>
            <Text style={styles.emptyText}>
              {searchText || filterType !== "all"
                ? "Intenta cambiar los filtros o el término de búsqueda"
                : "Cuando realices transacciones aparecerán aquí"}
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsContainer}>
            {filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Summary */}
      {!loadingTransactions && filteredTransactions.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {filteredTransactions.length} transacción(es) encontrada(s)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  searchAndFilters: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  filtersContainer: {
    marginHorizontal: -4,
  },
  filtersContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: "#F88D2A",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  transactionsContainer: {
    paddingBottom: 16,
  },
  summary: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
