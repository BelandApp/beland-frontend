import { useState } from "react";
import { getBackendErrorMessage, WithdrawService } from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import {
  BackendPaymentAccount,
  PaymentAccountService,
  UserRechargeService,
} from "src/services/financial";

type ActionType =
  | "approve"
  | "reject"
  | "create"
  | "modify"
  | "delete"
  | "changeStatus";
type EntityType = "withdraw" | "recharge" | "account" | "image";

export type HandleOpenFinancial = {
  id: string;
  action: ActionType;
  entity: EntityType;
  uri?: string;
  account?: BackendPaymentAccount;
};

type Props = {
  refreshWithdraws: () => void;
  refreshTransfers: () => void;
  refreshAccounts: () => void;
};

export const useFinanceAdminUI = ({
  refreshWithdraws,
  refreshTransfers,
  refreshAccounts,
}: Props) => {
  const [modal, setModal] = useState<EntityType | null>(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [reference, setReference] = useState("");
  const [observation, setObservation] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typeAction, setTypeAction] = useState<ActionType | null>(null);

  // Account states
  const [bank, setBanco] = useState("");
  const [type_account, setAccountType] = useState<
    "AHORRO" | "CORRIENTE" | null
  >(null);
  const [nro_account, setAccountNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ruc, setRuc] = useState("");
  const [cbu, setCbu] = useState("");
  const [alias, setAlias] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const handleOpen = ({
    id,
    action,
    entity,
    uri,
    account,
  }: HandleOpenFinancial) => {
    setSelectedId(id);
    setTypeAction(action);
    setModal(entity);

    if (entity === "image" && uri) {
      setImage(uri);
    }
    if (entity === "account" && account) {
      setAlias(account.alias);
      setAccountHolder(account.accountHolder);
      setAccountNumber(account.nro_account);
      setAccountType(account.type_account as any);
      setBanco(account.bank);
      setCbu(account.cbu);
      setEmail(account.email);
      setName(account.name);
    }
  };

  const handleCancel = () => {
    setModal(null);
    setReference("");
    setObservation("");
    setSelectedId(null);
    setTypeAction(null);
    setImage("");
    setCbu("");
    setName("");
    setAlias("");
    setRuc("");
    setAccountHolder("");
    setAccountNumber("");
    setBanco("");
    setAccountType(null);
    setEmail("");
  };

  const handleConfirm = async () => {
    if (!selectedId || !typeAction || !modal) return;

    try {
      setLoading(true);
      if (modal === "withdraw") {
        const data = {
          user_withdraw_id: selectedId,
          observation,
          reference,
        };

        if (typeAction === "approve") {
          await WithdrawService.approveWithdraw(data);
        } else {
          await WithdrawService.rejectWithdraw(data);
        }

        refreshWithdraws();
      }

      if (modal === "recharge") {
        if (typeAction === "approve") {
          await UserRechargeService.aprove(selectedId);
          notify.success({ message: "Transaccion aprobada correctamente" });
        } else {
          await UserRechargeService.reject(selectedId);
          notify.success({ message: "Transaccion rechazada correctamente" });
        }
        refreshTransfers();
      }

      if (modal === "account") {
        if (typeAction === "create") {
          if (!name || !bank || !accountHolder || !nro_account) {
            notify.error({ message: "Completa los campos requeridos" });
            return;
          }
          const payload = {
            name,
            accountHolder,
            bank,
            email,
            ruc,
            nro_account,
            cbu: cbu ? cbu : undefined,
            alias: alias ? alias : undefined,
            type_account,
          };
          await PaymentAccountService.createAccount(payload);
          notify.success({ message: "Cuenta creada correctamente" });
          refreshAccounts();
        }
        if (typeAction === "modify") {
          if (!name || !bank || !accountHolder || !nro_account) {
            notify.error({ message: "Completa los campos requeridos" });
            return;
          }
          const payload = {
            name,
            accountHolder,
            bank,
            email,
            is_active: true,
            ruc,
            nro_account,
            cbu: cbu ? cbu : undefined,
            alias: alias ? alias : undefined,
            type_account,
          };
          await PaymentAccountService.modifyAccount(selectedId, payload);
          refreshAccounts();
          notify.success({ message: "Cuenta modificada correctamente" });
        }
        if (typeAction === "delete") {
          await PaymentAccountService.deleteAccount(selectedId);
          notify.success({ message: "Cuenta Eliminada correctamente" });
          refreshAccounts();
        }
      }

      handleCancel();
    } catch (error) {
      const msg = getBackendErrorMessage(error);

      notify.error({
        message: msg || `Error en ${typeAction} la operación`,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleChangeStatusAccount = async (id: string, status: boolean) => {
    setLoading(true);
    try {
      status
        ? await PaymentAccountService.desactivateAccount(id)
        : await PaymentAccountService.activateAccount(id);
      notify.success({ message: "Estado cambiado correctamente" });
      refreshAccounts();
    } catch (error) {
      const msg = getBackendErrorMessage(error);

      notify.error({
        message: msg || `Error al cambiar el estado`,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    modal,
    image,
    reference,
    observation,
    typeAction,
    loading,
    setReference,
    setObservation,

    // Account setter
    accountHolder,
    setAccountHolder,
    ruc,
    setRuc,
    alias,
    setAlias,
    bank,
    setBanco,
    nro_account,
    setAccountNumber,
    type_account,
    setAccountType,
    email,
    setEmail,
    name,
    setName,
    cbu,
    setCbu,

    // handles
    handleOpen,
    handleCancel,
    handleConfirm,
    handleChangeStatusAccount,
  };
};
