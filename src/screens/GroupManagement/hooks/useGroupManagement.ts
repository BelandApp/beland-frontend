import { useState, useCallback } from "react";
import { Group, Participant, Product, PaymentMode } from "../../../types";
import { GroupService } from "@services/core";

export interface UseGroupManagementReturn {
  // Estados
  loading: boolean;
  error: string | null;

  // Gestión de participantes
  addParticipant: (
    groupId: string,
    participant: Participant
  ) => Promise<Group | null>;
  removeParticipant: (
    groupId: string,
    participantId: string
  ) => Promise<Group | null>;

  // Gestión de productos
  addProduct: (groupId: string, product: Product) => Promise<Group | null>;
  removeProduct: (groupId: string, productId: string) => Promise<Group | null>;
  updateProductQuantity: (
    groupId: string,
    productId: string,
    quantity: number
  ) => Promise<Group | null>;

  // Gestión de pagos
  updatePaymentMode: (
    groupId: string,
    paymentMode: PaymentMode,
    payingUserId?: string
  ) => Promise<Group | null>;
  updateParticipantCustomAmount: (
    groupId: string,
    participantId: string,
    amount: number
  ) => Promise<Group | null>;

  // Utilidades
  clearError: () => void;
}

export const useGroupManagement = (): UseGroupManagementReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsyncOperation = async <T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      return result;
    } catch (err) {
      setError(errorMessage);
      console.error(errorMessage, err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = useCallback(
    async (groupId: string, participant: Participant) => {
      const result = await handleAsyncOperation(
        () =>
          GroupService.inviteToGroup(groupId, [
            {
              email: participant.email,
              message: "Invitación al grupo",
            },
          ]),
        "Error al agregar participante al grupo"
      );
      // Return null since the API returns invitation result, not a Group
      return null;
    },
    []
  );

  const removeParticipant = useCallback(
    async (groupId: string, participantId: string) => {
      const result = await handleAsyncOperation(
        () => GroupService.removeMember(groupId, participantId),
        "Error al remover participante del grupo"
      );
      // Return null since the API returns success status, not a Group
      return null;
    },
    []
  );

  const addProduct = useCallback(async (groupId: string, product: Product) => {
    const result = await handleAsyncOperation(
      () =>
        GroupService.addToGroupOrder(groupId, [
          {
            product_id: product.id,
            quantity: 1,
          },
        ]),
      "Error al agregar producto al grupo"
    );
    // Return null since the API returns order result, not a Group
    return null;
  }, []);

  const removeProduct = useCallback(
    async (groupId: string, productId: string) => {
      // For now, we'll just return null since there's no direct remove product method
      console.log("Remove product not implemented:", productId);
      return null;
    },
    []
  );

  const updateProductQuantity = useCallback(
    async (groupId: string, productId: string, quantity: number) => {
      // For now, we'll just return null since there's no direct update quantity method
      console.log("Update quantity not implemented:", productId, quantity);
      return null;
    },
    []
  );

  const updatePaymentMode = useCallback(
    async (
      groupId: string,
      paymentMode: PaymentMode,
      payingUserId?: string
    ) => {
      // Since there's no payment_mode in UpdateGroupDto, we'll just return null for now
      console.log("Update payment mode not implemented:", paymentMode);
      return null;
    },
    []
  );

  const updateParticipantCustomAmount = useCallback(
    async (groupId: string, participantId: string, amount: number) => {
      // For now, we'll just return null since this specific method doesn't exist
      console.log(
        "Update participant custom amount not implemented:",
        participantId,
        amount
      );
      return null;
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    addParticipant,
    removeParticipant,
    addProduct,
    removeProduct,
    updateProductQuantity,
    updatePaymentMode,
    updateParticipantCustomAmount,
    clearError,
  };
};
