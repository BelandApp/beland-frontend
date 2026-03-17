import { useEffect, useState } from "react";
import { Transaction } from "../types";
import { getBackendErrorMessage, WalletService } from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import { TransfersService } from "src/services/financial/Transfer.service";

export const useTransferReceive = (transactionId: string) => {
  const [transfer, setTransfer] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"NotUII" | "other" | null>(null);
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const res = await TransfersService.GetTransactionById(transactionId);
        setTransfer(res);
        setLoading(false);
      } catch (error: any) {
        if (error?.status === 400) {
          setError("NotUII");
        } else {
          const message = getBackendErrorMessage(error);
          notify.error({ message });
          setError("other");
        }
        setLoading(false);
      }
    };
    if (transactionId) loadTransaction();
  }, []);

  return { transfer, loading, error };
};
