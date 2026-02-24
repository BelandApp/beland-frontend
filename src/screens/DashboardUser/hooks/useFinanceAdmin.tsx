import { useEffect, useState } from "react";
import { notify } from "src/hooks/notification/notify.external";
import { getBackendErrorMessage, WithdrawService } from "src/services";
import {
  BackendPaymentAccount,
  PaymentAccount,
  PaymentAccountService,
  UserRecharge,
  UserRechargeService,
  UserWithdraw,
} from "src/services/financial";

type ActionType = "approve" | "reject" | "create" | "modify" | "delete";
type EntityType = "withdraw" | "recharge" | "account" | "image";
export type HandleOpenFinancial = {
  id: string;
  action: ActionType;
  entity: EntityType;
  uri?: string;
  account?: BackendPaymentAccount;
};
export const useFinanceAdmin = () => {
  const [withDraw, setWithDraw] = useState<UserWithdraw[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [paymentsTransfer, setPaymentsTransfer] = useState<UserRecharge[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalWithdraw, setModalWithdraw] = useState(false);
  const [modalTransfer, setModalTransfer] = useState(false);
  const [modalImage, setModalImage] = useState(false);
  const [modalAccount, setModalAccount] = useState(false);

  const [image, setImage] = useState("");
  const [reference, setReference] = useState("");
  const [observation, setObservation] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typeAction, setTypeAction] = useState<ActionType | null>(null);
  const [entityType, setEntityType] = useState<EntityType | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const resRetiros = await WithdrawService.getWithdrawHistory(1, 0);
      const data = resRetiros.data;

      const pending = data.filter((i) => i?.status?.name === "Pendiente");
      const rest = data.filter((i) => i?.status?.name !== "Pendiente");
      // Withdraws
      setWithDraw([...pending, ...rest]);
      // Transfers
      const resIngresos = await UserRechargeService.getAll();
      setPaymentsTransfer(resIngresos);
      // Accounts
      const Accounts = await PaymentAccountService.getPaymentAccounts();
      const AccountsData = Accounts.data;
      setAccounts(AccountsData);
    } catch (err) {
      notify.error({ message: "No se pudieron cargar los datos" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpen = ({ id, action, entity, uri }: HandleOpenFinancial) => {
    setSelectedId(id);
    setTypeAction(action);
    setEntityType(entity);
    switch (entity) {
      case "account":
        setModalAccount(true);
        break;
      case "withdraw":
        setModalWithdraw(true);
        break;
      case "recharge":
        setModalTransfer(true);
        break;
      case "image":
        setModalImage(true);
        if (uri) setImage(uri);
        break;
    }
  };

  const handleCancel = () => {
    setModalAccount(false);
    setModalWithdraw(false);
    setModalTransfer(false);
    setReference("");
    setObservation("");
    setTypeAction(null);
    setEntityType(null);
    setSelectedId(null);
    setImage("");
  };

  const handleConfirm = async () => {
    if (!selectedId || !typeAction || !entityType) return;

    try {
      if (entityType === "withdraw") {
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
      }

      if (entityType === "recharge") {
        if (typeAction === "approve") {
          await UserRechargeService.aprove(selectedId);
        } else {
          await UserRechargeService.reject(selectedId);
        }
      }

      notify.success({ message: "Acción completada correctamente" });

      await loadData();
      handleCancel();
    } catch (error) {
      const msg = getBackendErrorMessage(error);
      notify.error({
        message:
          msg ||
          `Error al ${
            typeAction === "approve" ? "aprobar" : "rechazar"
          } la operación`,
      });
    }
  };

  const handleAddAccount = () => {};

  return {
    withDraw,
    paymentsTransfer,
    accounts,
    loading,

    modalAccount,
    modalImage,
    modalTransfer,
    modalWithdraw,
    handleOpen,
    handleCancel,
    handleConfirm,
    handleAddAccount,

    reference,
    setReference,
    observation,
    setObservation,
    image,
    typeAction,
    entityType,
  };
};
