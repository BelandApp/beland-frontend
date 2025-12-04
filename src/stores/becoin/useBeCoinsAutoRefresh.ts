import { useEffect } from "react";
import { useAuth } from "src/context";
import { SYNC_INTERVAL_1_HOUR } from "src/constants/timers";
import { useBeCoinsStore } from "./useBecoinStore";
import { useWallet} from "src/screens/Wallet";


export const useBeCoinsAutoRefresh = () => {
  const { isAuthenticated } = useAuth();
  const { lastSyncedAt, resetBalance } = useBeCoinsStore();
  const {refreshAll} =useWallet()
  useEffect(() => {
    if (!isAuthenticated) {
      resetBalance();
      return;
    }

    const needsSync =
      !lastSyncedAt || Date.now() - lastSyncedAt > SYNC_INTERVAL_1_HOUR;

    if (needsSync) {
      refreshAll()
    }
  }, [isAuthenticated]);
  return {lastSyncedAt}
};
