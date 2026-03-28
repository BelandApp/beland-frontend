import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { PaymentMethod, PaymentPreferencesData } from "../types";
import {
  getBackendErrorMessage,
  WalletService,
  WithdrawAccount,
  WithdrawService,
} from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import useAddWithdrawAccount from "./useAddWithdrawAccount";
import { TransactionService } from "src/services/TransactionApiService";
import { Wallet } from "src/services/WalletApiService";

export type ModalsAccountType = "addAccount" | "detailAccount" | "none";

export const usePaymentPreferences = () => {
  const [accounts, setAccounts] = useState<WithdrawAccount[] | null>(null);
  const [account, setAccount] = useState<WithdrawAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalsAccountType>("none");

  const loadAccounts = async (force?: boolean) => {
    if (accounts && !force) return;
    try {
      setLoading(true);
      const res = await WithdrawService.getWithdrawAccounts();
      setAccounts(res.data);
    } catch {
      notify.error({ message: "No se pudieron cargar los retiros" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAccounts();
  }, []);

  const openModal = (type: ModalsAccountType, item?: WithdrawAccount) => {
    if (item) {
      setAccount(item);
    }
    setModal(type);
  };
  const closeModal = () => {
    setModal("none");
  };
  const handleDelete = async (id: string) => {
    notify.confirm({
      message: "Estas seguro de querer borrar?",
      onConfirm: async () => {
        setLoading(true);
        try {
          await WithdrawService.deleteWithdrawAccount(account?.id ?? id);
          notify.success({ message: "Cuenta Borrada" });

          loadAccounts(true);
        } catch {
          notify.error({
            message: `No se pudo borrar la cuenta`,
          });
        } finally {
          setLoading(false);
          setTimeout(() => {
            setModal("none");
          }, 3000);
        }
      },
    });
  };
  const handleChangeStatus = async () => {
    if (!account) return;
    setLoading(true);
    try {
      if (account?.is_active) {
        await WithdrawService.deactivateWithdrawAccount(account.id);
        notify.success({ message: "Cuenta Desactivada" });
      } else {
        await WithdrawService.activateWithdrawAccount(account.id);
        notify.success({ message: "Cuenta Activada" });
      }
      loadAccounts(true);
    } catch {
      notify.error({
        message: `No se pudo ${account.is_active ? "Suspender" : "Activar"} la cuenta`,
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setModal("none");
      }, 3000);
    }
  };
  const handleAddSuccess = () => {
    try {
      setLoading(true);
      notify.success({ message: "Cuenta creada con éxito" });
      loadAccounts(true);
    } catch {
      notify.error({
        message: "No se pudo crear la cuenta",
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setModal("none");
      }, 3000);
    }
  };

  const addHook = useAddWithdrawAccount({
    visible: modal !== "none",
    onAdd: handleAddSuccess,
    onClose: () => setModal("none"),
  });
  return {
    account,
    accounts,
    loadAccounts,
    loading,
    modal,
    //handlers
    openModal,
    handleDelete,
    handleChangeStatus,
    // settlers
    closeModal,
    addHook,
  };
};
