import { Activity } from "../types";
import { useBeCoinsStore } from "../../../stores/useBeCoinsStore";
import { useAuth } from "@/context/AuthContext";

export const useDashboardData = () => {
  const { balance } = useBeCoinsStore();
  const { user } = useAuth();

  const userStats = {
    userName: user?.full_name || user?.email?.split("@")[0] || "Usuario",
    coinsAmount: balance,
    bottlesRecycled: 0, // TODO: Implementar conteo real de botellas recicladas
  };

  const getRecentActivities = (): Activity[] => {
    // TODO: Implementar con datos reales de transacciones
    return [];
  };

  return {
    userStats,
    activities: getRecentActivities(),
  };
};
