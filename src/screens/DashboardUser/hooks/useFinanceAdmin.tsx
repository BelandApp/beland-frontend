import { useEffect, useState } from "react";
import { notify } from "src/hooks/notification/notify.external";
import { WithdrawService } from "src/services";
import { UserWithdraw } from "src/services/withdrawService";

export const useFinanceAdmin = () => {
  const [withDraw, setWithDraw] = useState<UserWithdraw[] | []>([]);
  const [loading, setLoading] = useState(false);
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
  return { withDraw, loading };
};
