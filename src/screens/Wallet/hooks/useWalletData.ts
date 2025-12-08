import { useEffect, useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBeCoinsStore } from "@/stores";
import { WalletService, PaymentService, Wallet } from "@services/core";
import { getBackendErrorMessage } from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import { mapBackendTransactionToFrontend } from "./useWalletTransactions";
import { Transaction } from "../types";

export const useWallet = () => {
  const { user } = useAuth();
  const { syncFromBackend, balance } = useBeCoinsStore();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletId, setWalletId] = useState<string | null>(null);

  const [loadingWallet, setLoadingWallet] = useState(false);
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
  const fetchWalletId = useCallback(async () => {
    if (!user) return;

    try {
      const w = await WalletService.getCurrentUserWallet();
      setWalletId(w.id);
    } catch (err) {
      setWalletId(null);
    }
  }, [user]);

  /** -----------------------------------------
   *  FETCH: TRANSACTIONS
   ------------------------------------------*/
  const fetchTransactions = useCallback(async () => {
    if (!walletId) return;
    setLoadingTransactions(true);

    try {
      const resp = await WalletService.getTransactions(1, 20, walletId);
      const arr = Array.isArray(resp[0]) ? resp[0] : resp;
      setTransactions(arr.map(mapBackendTransactionToFrontend));
    } catch (err) {
      notify.error({ message: getBackendErrorMessage(err) });
    } finally {
      setLoadingTransactions(false);
    }
  }, [walletId]);

  /** -----------------------------------------
   *  INITIAL LOAD
   ------------------------------------------*/
  useEffect(() => {
    if (!user) return;

    fetchWalletId();
    fetchWallet();
  }, [user]);

  /** -----------------------------------------
   *  LOAD TRANSACTIONS WHEN walletId EXISTS
   ------------------------------------------*/
  useEffect(() => {
    if (walletId) fetchTransactions();
  }, [walletId]);

  /** -----------------------------------------
   *  PUBLIC REFRESH
   ------------------------------------------*/
  const refreshAll = () => {
    fetchWallet();
    fetchTransactions();
  };

  return {
    walletData: {
      balance,
      locked_balance: wallet?.locked_balance ?? 0,
      alias: wallet?.alias,
      estimatedValue: (balance * 0.05).toFixed(2),
    },
    wallet,
    transactions,
    loadingWallet,
    loadingTransactions,
    refreshAll,
  };
};
