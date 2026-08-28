import { useState } from "react";
import {
  PaymentAccount,
  PaymentAccountService,
  UserRecharge,
  UserRechargeService,
  UserWithdraw,
} from "src/services/financial";
import { WithdrawService } from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import {
  ExperiencePurchase,
  ExperiencesPurchasesService,
} from "src/services/financial/Experiences.service";
import { ExperienceService } from "src/services/experience/ExperienceApiService";

export type FinanceTab = "withdraw" | "transfer" | "account";

export const useFinanceAdminData = () => {
  const [withdraws, setWithdraws] = useState<UserWithdraw[] | null>(null);
  const [transfers, setTransfers] = useState<UserRecharge[] | null>(null);
  const [accounts, setAccounts] = useState<PaymentAccount[] | null>(null);
  const [experiences, setExperiences] = useState<ExperiencePurchase[] | null>(
    null,
  );
  const [loadingWithdraws, setLoadingWithdraws] = useState(false);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [loadingExperiences, setLoadingExperiences] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const loadWithdraws = async (force?: boolean) => {
    if (withdraws && !force) return;

    try {
      setLoadingWithdraws(true);

      const res = await WithdrawService.getWithdrawHistory(1, 0);
      const data = res.data;
      const pending = data.filter((i) => i?.status?.name === "Pendiente");
      const rest = data.filter((i) => i?.status?.name !== "Pendiente");

      setWithdraws([...pending, ...rest]);
    } catch {
      notify.error({ message: "No se pudieron cargar los retiros" });
    } finally {
      setLoadingWithdraws(false);
    }
  };
  const loadExperiences = async (force?: boolean) => {
    if (experiences && !force) return;

    try {
      setLoadingExperiences(true);

      const res = await ExperiencesPurchasesService.getAllExperiences();
      console.log("res", res);
      const data = res.data;
      console.log("Data", data);
      const reservado = data.filter((i) => i?.status === "RESERVADO");
      const pagado = data.filter((i) => i?.status === "PAGADO");
      const entregado = data.filter((i) => i?.status === "ENTREGADO");

      setExperiences([...reservado, ...pagado, ...entregado]);
    } catch {
      notify.error({
        message: "No se pudieron cargar las experiences vendidas",
      });
    } finally {
      setLoadingExperiences(false);
    }
  };

  const loadTransfers = async (force?: boolean) => {
    if (transfers && !force) return;

    try {
      setLoadingTransfers(true);
      const res = await UserRechargeService.getAll();
      setTransfers(res);
    } catch {
      notify.error({ message: "No se pudieron cargar las transferencias" });
    } finally {
      setLoadingTransfers(false);
    }
  };

  const loadAccounts = async (force?: boolean) => {
    if (accounts && !force) return;

    try {
      setLoadingAccounts(true);
      const res = await PaymentAccountService.getPaymentAccounts();
      console.log("REspuesta", res);
      setAccounts(res.data);
    } catch {
      notify.error({ message: "No se pudieron cargar las cuentas" });
    } finally {
      setLoadingAccounts(false);
    }
  };

  const refreshWithdraws = () => loadWithdraws(true);
  const refreshTransfers = () => loadTransfers(true);
  const refreshAccounts = () => loadAccounts(true);
  const refreshExperiences = () => loadExperiences(true);

  return {
    withdraws,
    transfers,
    accounts,
    experiences,

    loadingWithdraws,
    loadingTransfers,
    loadingAccounts,
    loadingExperiences,

    loadWithdraws,
    loadTransfers,
    loadAccounts,
    loadExperiences,

    refreshWithdraws,
    refreshTransfers,
    refreshAccounts,
    refreshExperiences,
  };
};
