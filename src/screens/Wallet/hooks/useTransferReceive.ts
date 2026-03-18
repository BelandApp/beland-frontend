import { useEffect, useState } from "react";
import { Transaction } from "../types";
import { getBackendErrorMessage, WalletService } from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import { TransfersService } from "src/services/financial/Transfer.service";

export const useTransferReceive = (id: string) => {
  const [transfer, setTransfer] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"NotUII" | "401" | "other" | null>(null);
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const res = await TransfersService.GetTransactionById(id);
        setTransfer(res);
        setLoading(false);
      } catch (error: any) {
        if (error?.status === 400) {
          setError("NotUII");
        } else if (error?.status == 401) {
          setError("401");
        } else {
          setError("other");
        }
        setLoading(false);
      }
    };
    if (id) {
      loadTransaction();
    }
  }, []);

  return { transfer, loading, error };
};
