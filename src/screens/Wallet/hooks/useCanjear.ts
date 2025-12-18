import { useState, useEffect } from "react";
import { useAuth } from "src/context";
import {
  convertBeCoinsToUSD,
  formatUSDPrice,
} from "../../../constants/currency";
import {
  WithdrawService,
  WithdrawAccount,
} from "../../../services/withdrawService";
import { useWallet } from "./useWalletData";
import { getBackendErrorMessage } from "src/services";
import { useNotify } from "src/hooks";
import { useBeCoinsStore } from "src/stores";

export const useCanjear = (navigation: any) => {
  const { user, handleAuth0Login } = useAuth();
  const notify = useNotify();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWithdrawAccount, setSelectedWithdrawAccount] =
    useState<WithdrawAccount | null>(null);
  const [withdrawAccounts, setWithdrawAccounts] = useState<WithdrawAccount[]>(
    []
  );
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const { balance, locked_balance, setBalance } = useBeCoinsStore();
  const { refreshAll } = useWallet();

  // Constantes de configuración
  const exchangeRate = 20; // 20 BC = 1 USD
  const commission = 0.01; // 1%

  // Cargar cuentas de retiro al montar el componente
  useEffect(() => {
    loadWithdrawAccounts();
  }, []);

  const loadWithdrawAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await WithdrawService.getWithdrawAccounts();
      const activeAccounts = response.data.filter(
        (account: WithdrawAccount) => account.is_active
      );
      setWithdrawAccounts(activeAccounts);

      // Si solo hay una cuenta activa, seleccionarla automáticamente
      if (activeAccounts.length === 1) {
        setSelectedWithdrawAccount(activeAccounts[0]);
      }
    } catch (error) {
      console.error("Error cargando cuentas de retiro:", error);
      const message = getBackendErrorMessage(error);
      notify.error({ message: message || "Error cargando cuentas de retiro" });
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Cálculos
  const parsedAmount = parseFloat(amount) || 0;
  const isAmountValid = parsedAmount > 0 && parsedAmount <= balance;
  const canContinue =
    isAmountValid && selectedWithdrawAccount && !loadingAccounts;

  const calculateUSD = (bc: number) => {
    const usd = bc / exchangeRate;
    const fee = usd * commission;
    return {
      gross: usd.toFixed(2),
      fee: fee.toFixed(2),
      net: (usd - fee).toFixed(2),
    };
  };

  const amounts = calculateUSD(parsedAmount);

  // Funciones de formato de cuenta
  const getAccountDisplayName = (account: WithdrawAccount) => {
    if (account.withdraw_account_type?.code === "WALLET") {
      const provider = account.provider || "Billetera virtual";
      const phone = account.phone || "N/A";
      return `${provider} - Tel: ${phone}`;
    } else if (account.withdraw_account_type?.code === "BANK") {
      if (account.cbu) {
        return `Cuenta bancaria - CBU: ***${account.cbu.slice(-4)}`;
      } else if (account.alias) {
        return `Cuenta bancaria - Alias: ${account.alias}`;
      } else {
        return "Cuenta bancaria";
      }
    }
    return account.alias || account.owner_name || "Cuenta";
  };

  const getAccountTitle = (account: WithdrawAccount) => {
    if (account.alias) {
      return account.alias;
    }
    if (account.withdraw_account_type?.code === "WALLET" && account.provider) {
      return `${account.provider} - ${account.owner_name}`;
    }
    return account.owner_name || "Cuenta";
  };

  const getAccountNameForConfirmation = (account: WithdrawAccount) => {
    if (account.alias) {
      return account.alias;
    }
    if (account.cbu) {
      return `CBU ***${account.cbu.slice(-4)}`;
    }
    if (account.provider && account.phone) {
      return `${account.provider} (${account.phone})`;
    }
    if (account.provider) {
      return account.provider;
    }
    return account.owner_name || "tu cuenta";
  };

  // Validación de input
  const handleAmountChange = (text: string) => {
    const numericRegex = /^[0-9]*\.?[0-9]*$/;

    if (text === "") {
      setAmount(text);
      return;
    }

    if (numericRegex.test(text)) {
      const dotCount = (text.match(/\./g) || []).length;
      if (dotCount <= 1) {
        if (!text.startsWith(".")) {
          const parts = text.split(".");
          if (parts.length === 1 || parts[1].length <= 2) {
            if (!text.match(/^0[0-9]/)) {
              setAmount(text);
            }
          }
        }
      }
    }
  };

  // Handlers principales
  const handleBuy = async () => {
    if (!isAmountValid) {
      notify.error({
        message:
          "Por favor ingresa un monto valido dentro de tu saldo disponible.",
      });
      return;
    }

    if (!selectedWithdrawAccount) {
      notify.error({
        message: "Por favor selecciona una cuenta donde recibir tu dinero.",
      });
      return;
    }

    if (!user?.id) {
      notify.confirm({
        message: "Debes iniciar sesión para adquirir",
        onConfirm: () => handleAuth0Login(),
      });
      return;
    }

    notify.confirm({
      message: selectedWithdrawAccount
        ? `¿Estás seguro de que quieres retirar ${formatUSDPrice(
            convertBeCoinsToUSD(parsedAmount)
          )} USD (${parsedAmount} BeCoins) a tu cuenta ${getAccountNameForConfirmation(
            selectedWithdrawAccount
          )}?`
        : "¿Confirmas esta operación?",
      onConfirm: () => confirmWithdraw(),
    });
  };

  const confirmWithdraw = async () => {
    try {
      setIsLoading(true);
      const withdrawRequest = {
        amountBecoin: parsedAmount,
        withdraw_account_id: selectedWithdrawAccount!.id,
      };

      console.log("💰 Solicitando retiro:", withdrawRequest);
      const response = await WithdrawService.requestWithdraw(withdrawRequest);

      if (response) {
        setBalance(parsedAmount);

        if (refreshAll) {
          refreshAll();
        }

        notify.success({
          message: `¡Retiro exitoso! Se han transferido ${formatUSDPrice(
            convertBeCoinsToUSD(parsedAmount)
          )} USD a tu cuenta ${getAccountNameForConfirmation(
            selectedWithdrawAccount!
          )}.`,
        });

        setAmount("");
        setSelectedWithdrawAccount(null);
      }
    } catch (error: any) {
      console.error("Error en el retiro:", error);
      let errorMessage = "Ocurrió un error inesperado. Intenta nuevamente.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      notify.error({ message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = () => {
    navigation.navigate("MainTabs", { screen: "Wallet" });
  };

  const handleSelectAccount = (account: WithdrawAccount) => {
    setSelectedWithdrawAccount(account);
    setShowAccountSelector(false);
  };

  const setPresetAmount = (preset: number) => {
    setAmount(preset.toString());
  };

  return {
    // Estados
    amount,
    isLoading,
    selectedWithdrawAccount,
    withdrawAccounts,
    loadingAccounts,
    showAccountSelector,
    balance,
    locked_balance,

    // Valores calculados
    parsedAmount,
    isAmountValid,
    canContinue,
    amounts,
    exchangeRate,

    // Funciones de formato
    getAccountDisplayName,
    getAccountTitle,
    getAccountNameForConfirmation,

    // Handlers
    handleAmountChange,
    handleBuy,
    handleAddAccount,
    handleSelectAccount,
    setShowAccountSelector,
    setPresetAmount,

    // Utilidades
    formatUSDPrice,
    convertBeCoinsToUSD,
  };
};
