import { useEffect, useState } from "react";
import { notify } from "src/hooks/notification/notify.external";
import { getBackendErrorMessage, WithdrawService } from "src/services";
import { UserWithdraw } from "src/services/withdrawService";

export const useFinanceAdmin = () => {
  const [withDraw, setWithDraw] = useState<UserWithdraw[] | []>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [reference, setReference] = useState<string>("");
  const [observation, setObservation] = useState<string>("");
  const [user_withdraw_id, setUser_withdraw_id] = useState<string>("");
  const [typeAction, setTypeAction] = useState<"approve" | "reject" | null>(
    null,
  );
  const loadAccountTypes = async () => {
    try {
      setLoading(true);
      const res = await WithdrawService.getWithdrawHistory();
      console.log("retiros pendientes", res);
      const data = res.data;
      setWithDraw(Array.isArray(data) ? (data as any) : []);
    } catch (err) {
      console.error(err);
      notify.error({ message: "No se pudieron cargar los tipos de cuenta" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAccountTypes();
  }, []);
  const handleOpen = (
    user_withdraw_id: string,
    type: "approve" | "reject" | null,
  ) => {
    setModalOpen(true);
    setUser_withdraw_id(user_withdraw_id);
    setTypeAction(type);
  };
  const handleCancel = () => {
    setModalOpen(false);
    setReference("");
    setObservation("");
    setTypeAction(null);
  };

  const PutWithdraw = async () => {
    try {
      const data = {
        user_withdraw_id,
        observation,
        reference,
      };
      if (typeAction === "approve") {
        await WithdrawService.approveWithdraw(data);
      }
      if (typeAction === "reject") {
        await WithdrawService.rejectWithdraw(data);
      } else {
        notify.error({ message: "Error al seleccionar tipo" });
      }
      notify.success({ message: "Acción completada" });
      setTimeout(handleCancel, 3000);
    } catch (error) {
      const res = getBackendErrorMessage(error);
      notify.error({
        message:
          res ||
          `Error al ${typeAction === "approve" ? "Aprobar" : "Rechazar"} el retiro`,
      });
    }
  };

  return {
    withDraw,
    loading,
    modalOpen,
    handleOpen,
    reference,
    setReference,
    observation,
    setObservation,
    handleCancel,
    PutWithdraw,
  };
};
