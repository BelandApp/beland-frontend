import { useEffect, useState } from "react";
import { notify } from "src/hooks/notification/notify.external";
import { getBackendErrorMessage, WithdrawService } from "src/services";
import {
  UserRecharge,
  UserRechargeService,
  UserWithdraw,
} from "src/services/financial";

type ActionType = "approve" | "reject";
type EntityType = "withdraw" | "recharge";

export const useFinanceAdmin = () => {
  const [withDraw, setWithDraw] = useState<UserWithdraw[]>([]);
  const [paymentsTransfer, setPaymentsTransfer] = useState<UserRecharge[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState(false);

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

      setWithDraw([...pending, ...rest]);

      const resIngresos = await UserRechargeService.getAll();
      setPaymentsTransfer(resIngresos);
    } catch (err) {
      notify.error({ message: "No se pudieron cargar los datos" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpen = (id: string, action: ActionType, entity: EntityType) => {
    setSelectedId(id);
    setTypeAction(action);
    setEntityType(entity);
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalOpen(false);
    setReference("");
    setObservation("");
    setTypeAction(null);
    setEntityType(null);
    setSelectedId(null);
  };

  const openImage = (uri: string) => {
    setImage(uri);
    setImageModal(true);
  };

  const closeImage = () => {
    setImageModal(false);
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

  return {
    withDraw,
    paymentsTransfer,
    loading,

    modalOpen,
    handleOpen,
    handleCancel,
    handleConfirm,

    reference,
    setReference,
    observation,
    setObservation,

    imageModal,
    openImage,
    closeImage,
    image,
  };
};
