import { useMemo, useState } from "react";
import { Transaction } from "../types";
import { TRANSACTION_FILTER_MAP } from "../types/transactions";

export const useTransactionFilters = (transactions?: Transaction[]) => {
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((tx) => {
      // SEARCH (por name + opcionalmente otros campos)
      const matchesSearch =
        tx.type.name.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.type.code.toLowerCase().includes(searchText.toLowerCase());

      // FILTER
      if (filterType === "all") return matchesSearch;

      const allowedCodes = TRANSACTION_FILTER_MAP[filterType] || [];

      const matchesFilter = allowedCodes.includes(tx.type.code);

      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchText, filterType]);

  return {
    searchText,
    setSearchText,
    filterType,
    setFilterType,
    filteredTransactions,
  };
};
