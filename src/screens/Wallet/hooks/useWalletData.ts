import { useEffect, useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBeCoinsStore } from "@/stores";
import { WalletService, PaymentService, Wallet } from "@services/core";
import { getBackendErrorMessage } from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import { Transaction, WalletData } from "../types";

export const useWallet = () => {
  const { user } = useAuth();
  const { syncFromBackend, balance } = useBeCoinsStore();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 20;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState("");

  const [loadingTransactions, setLoadingTransactions] = useState(false);

  /** -----------------------------------------
   *  FETCH: WALLET + sync store
   ------------------------------------------*/
  const fetchWallet = useCallback(async () => {
    if (!user) return;

    setLoadingWallet(true);

    try {
      const w = await PaymentService.getWallet();
      setWallet(w);

      // Evitar llamada duplicada: usar el id retornado por PaymentService.getWallet
      if (w && w.id) setWalletId(w.id);

      const parsedBalance = w.becoin_balance || 0;
      const parsedLocked = w.locked_balance || 0;

      syncFromBackend({
        balance: parsedBalance,
        locked_balance: parsedLocked,
      });
    } catch (err) {
      notify.error({ message: getBackendErrorMessage(err) });
    } finally {
      setLoadingWallet(false);
    }
  }, [user]);

  /** -----------------------------------------
   *  FETCH: WALLET ID
   ------------------------------------------*/
  /** -----------------------------------------
   *  FETCH: TRANSACTIONS
   ------------------------------------------*/
  const fetchTransactions = useCallback(
    async (pageToLoad = 1, isLoadMore = false) => {
      if (!walletId) return;

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoadingTransactions(true);
      }

      try {
        const { data, total } = await WalletService.getTransactions(
          pageToLoad,
          LIMIT,
          walletId,
        );

        setTotalTransactions(total);

        setTransactions((prev) => (isLoadMore ? [...prev, ...data] : data));

        // calcular si hay más páginas
        const totalLoaded =
          (isLoadMore ? transactions.length : 0) + data.length;
        setHasMore(totalLoaded < total);

        setPage(pageToLoad);
      } catch (err) {
        notify.error({ message: getBackendErrorMessage(err) });
      } finally {
        setLoadingTransactions(false);
        setLoadingMore(false);
      }
    },
    [walletId, transactions.length],
  );

  const loadMoreTransactions = () => {
    if (loadingMore || loadingTransactions || !hasMore) return;

    fetchTransactions(page + 1, true);
  };

  /** -----------------------------------------
   *  INITIAL LOAD
   ------------------------------------------*/
  useEffect(() => {
    if (!user) return;

    fetchWallet();
  }, [user]);

  /** -----------------------------------------
   *  LOAD TRANSACTIONS WHEN walletId EXISTS
   ------------------------------------------*/
  useEffect(() => {
    if (!walletId) return;

    setPage(1);
    setHasMore(true);
    setTransactions([]);

    fetchTransactions(1, false);
  }, [walletId]);

  /** -----------------------------------------
   *  PUBLIC REFRESH
   ------------------------------------------*/
  const refreshAll = () => {
    fetchWallet();
    fetchTransactions();
  };

  const walletData: WalletData = {
    balance,
    becoin_green: wallet?.becoin_green ?? 0,
    becoin_orange: wallet?.becoin_orange ?? 0,
    locked_balance: wallet?.locked_balance ?? 0,
    alias: wallet?.alias ?? "",
    estimatedValue: (balance * 0.05).toFixed(2),
  };
  return {
    walletData,
    wallet,
    transactions,
    totalTransactions,
    loadingWallet,
    loadingTransactions,
    loadingMore,
    hasMore,
    loadMoreTransactions,
    refreshAll,
  };
};
