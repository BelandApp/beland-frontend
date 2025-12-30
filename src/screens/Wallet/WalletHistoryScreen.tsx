import React, { useEffect, useState } from "react";
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
import { SearchBarInput, ThemedHeader } from "src/components";
import { useWallet } from "./hooks";
import { Pressable } from "react-native";
import { Transaction } from "./types";
import { CoreApiService } from "src/services";
import TransactionModal from "./modal/transaction.modal";
export default function WalletHistoryScreen() {
  const { transactions, loadingTransactions } = useWallet();
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [modalTransaction, setModalOpen] = useState<Transaction | null>(null);
  const filterOptions = [
    { id: "all", label: "Todas", icon: "format-list-bulleted" },
    { id: "transferencia", label: "Enviados", icon: "arrow-up-right" },
    { id: "receive", label: "Recibidos", icon: "arrow-down-left" },
    { id: "recarga", label: "Recargas", icon: "plus-circle" },
    { id: "canje", label: "Canjes", icon: "swap-horizontal" },
    { id: "pago", label: "Compras", icon: "credit-card-minus" },
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
    <View className="flex-1 bg-[#f8f9fa]">
      {/* Header */}
      <ThemedHeader canGoBack title="Transacciones" />

      {/* Search and Filters */}
      <View className="p-4">
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
          contentContainerClassName="gap-2"
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              className={`flex-row items-center px-3 py-2 rounded-xl ${
                filterType === option.id && "bg-[#F88D2A]"
              } `}
              onPress={() => handleFilterPress(option.id)}
            >
              <MaterialCommunityIcons
                name={option.icon as any}
                size={16}
                color={filterType === option.id ? "#fff" : "#666"}
              />
              <Text
                className={`font-medium ml-1 text-sm text-gray-600 ${
                  filterType === option.id && "text-white"
                } `}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView className="flex-1 px-3">
        {loadingTransactions ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color="#F88D2A" />
            <Text className="text-base text-gray-600 mt-2">
              Cargando transacciones...
            </Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View className="items-center justify-center py-16 px-8">
            <MaterialCommunityIcons name="receipt" size={64} color="#ccc" />
            <Text className="text-sm text-center text-gray-500">
              {searchText || filterType !== "all"
                ? "No se encontraron transacciones"
                : "Sin transacciones"}
            </Text>
            <Text className="text-sm text-center text-gray-500">
              {searchText || filterType !== "all"
                ? "Intenta cambiar los filtros o el término de búsqueda"
                : "Cuando realices transacciones aparecerán aquí"}
            </Text>
          </View>
        ) : (
          <View className="pb-4">
            {filteredTransactions.map((transaction) => (
              <Pressable
                onPress={() => setModalOpen(transaction)}
                key={transaction.id}
              >
                <TransactionCard transaction={transaction} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Summary */}
      {!loadingTransactions && filteredTransactions.length > 0 && (
        <View className="px-4 py-2 border-t border-gray-200">
          <Text className="text-center text-sm text-gray-500">
            {filteredTransactions.length} transacción(es) encontrada(s)
          </Text>
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
}
