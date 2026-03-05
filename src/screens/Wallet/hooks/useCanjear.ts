import { useState, useEffect } from "react";
import { useAuth } from "src/context";
import {
  convertBeCoinsToUSD,
  convertUSDToBeCoins,
  formatUSDPrice,
} from "../../../constants/currency";
import {
  WithdrawService,
  WithdrawAccount,
  getBackendErrorMessage,
} from "@/services";
import { useWallet } from "./useWalletData";
import { useCustomNavigation, useNotify } from "src/hooks";
import { useBeCoinsStore } from "src/stores";

export const useCanjear = () => {
  const { user, handleAuth0Login } = useAuth();
  const notify = useNotify();
  const { navigate } = useCustomNavigation();
  /** ---------------- STATE ---------------- */
  const [amount, setAmount] = useState(""); // 👈 USD (FUENTE DE VERDAD)
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWithdrawAccount, setSelectedWithdrawAccount] =
    useState<WithdrawAccount | null>(null);
  const [withdrawAccounts, setWithdrawAccounts] = useState<WithdrawAccount[]>(
    [],
  );
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  const { balance, locked_balance, setBalance, getBeCoinsInUSD } =
    useBeCoinsStore();
  const { refreshAll } = useWallet();

  /** ---------------- LOAD ACCOUNTS ---------------- */
  useEffect(() => {
    loadWithdrawAccounts();
  }, []);

  const loadWithdrawAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const resp = await WithdrawService.getWithdrawAccounts();
      console.log("RAW RESP:", JSON.stringify(resp, null, 2));
      console.log("TYPEOF RESP:", typeof resp);
      console.log("IS ARRAY:", Array.isArray(resp));

      const items = Array.isArray((resp as any)?.data)
        ? (resp as any).data
        : Array.isArray(resp)
          ? resp
          : [];

      const activeAccounts = items.filter(
        (account: WithdrawAccount) => account?.is_active,
      );

      setWithdrawAccounts(activeAccounts);

      if (activeAccounts.length === 1) {
        setSelectedWithdrawAccount(activeAccounts[0]);
      }
    } catch (error) {
      console.error("Error cargando cuentas:", error);
      notify.error({ message: getBackendErrorMessage(error) });
    } finally {
      setLoadingAccounts(false);
    }
  };

  /** ---------------- MONETARY MODEL ---------------- */
  const amountUSD = parseFloat(amount) || 0;
  const amountBC = convertUSDToBeCoins(amountUSD);

  const isAmountValid = amountUSD > 0 && amountBC <= balance;

  const canContinue =
    isAmountValid && selectedWithdrawAccount && !loadingAccounts;

  /** ---------------- ACCOUNT FORMATTERS ---------------- */
  const getAccountDisplayName = (account: WithdrawAccount) => {
    const typeName = account.withdraw_account_type?.name || "Cuenta";
    const currency = (account as any).currency || "USD";
    return `${typeName} · ${currency}`;
  };

  const getAccountTitle = (account: WithdrawAccount) => {
    const bank =
      (account as any).bankName || account.provider || account.alias || "";
    const cbu = account.cbu || (account as any).accountNumber || "";
    const last4 = cbu ? cbu.slice(-4) : "";
    return bank ? `${bank}${last4 ? ` **** ${last4}` : ""}` : "Cuenta";
  };

  const getAccountNameForConfirmation = (account: WithdrawAccount) => {
    if (account.alias) return account.alias;
    if (account.cbu) return `CBU **** ${account.cbu.slice(-4)}`;
    return account.provider || account.owner_name || "tu cuenta";
  };

  /** ---------------- INPUT VALIDATION (USD) ---------------- */
  const handleAmountChange = (text: string) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (text === "" || regex.test(text)) {
      const parts = text.split(".");
      if (parts.length === 1 || parts[1].length <= 2) {
        setAmount(text);
      }
    }
  };

  /** ---------------- ACTIONS ---------------- */
  const handleBuy = async () => {
    if (!isAmountValid) {
      notify.error({
        message: "Monto inválido o saldo insuficiente.",
      });
      return;
    }

    if (!selectedWithdrawAccount) {
      notify.error({ message: "Selecciona una cuenta de retiro." });
      return;
    }

    if (!user?.id) {
      notify.confirm({
        message: "Debes iniciar sesión",
        onConfirm: () => handleAuth0Login(),
      });
      return;
    }

    notify.confirm({
      message: `¿Retirar ${formatUSDPrice(amountUSD)} USD (${amountBC} BeCoins) a ${getAccountNameForConfirmation(
        selectedWithdrawAccount,
      )}?`,
      onConfirm: confirmWithdraw,
    });
  };

  const confirmWithdraw = async () => {
    try {
      setIsLoading(true);

      const withdrawRequest = {
        amountBecoin: amountBC, // 👈 backend trabaja en BC
        withdraw_account_id: selectedWithdrawAccount!.id,
      };

      await WithdrawService.requestWithdraw(withdrawRequest);

      setBalance(balance - amountBC);
      refreshAll?.();

      notify.success({
        message: `Retiro exitoso: ${formatUSDPrice(amountUSD)} USD enviados.`,
      });

      setAmount("");
      setSelectedWithdrawAccount(null);
    } catch (error: any) {
      notify.error({
        message:
          error?.response?.data?.message || "Error procesando el retiro.",
      });
    } finally {
      setIsLoading(false);
      navigate("WalletHistoryScreen");
    }
  };

  const handleAddAccount = () => {
    navigate("MainTabs", { screen: "Wallet" });
  };

  const handleSelectAccount = (account: WithdrawAccount) => {
    setSelectedWithdrawAccount(account);
    setShowAccountSelector(false);
  };

  const setPresetAmount = (usd: number) => {
    setAmount(usd.toString());
  };

  /** ---------------- EXPORT ---------------- */
  return {
    amount,
    isLoading,
    selectedWithdrawAccount,
    withdrawAccounts,
    loadingAccounts,
    showAccountSelector,
    balance,
    balanceUSD: getBeCoinsInUSD(balance),
    locked_balance,

    amountUSD,
    amountBC,
    isAmountValid,
    canContinue,

    getAccountDisplayName,
    getAccountTitle,
    getAccountNameForConfirmation,

    handleAmountChange,
    handleBuy,
    handleAddAccount,
    handleSelectAccount,
    setShowAccountSelector,
    setPresetAmount,

    formatUSDPrice,
    convertBeCoinsToUSD,
  };
};
