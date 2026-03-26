import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

export const useDashboardNavigation = () => {
  const { navigate } = useCustomNavigation();

  const navigateViewHistory = () => {
    navigate("HistoryScreen");
  };
  const navigateRecyclingMapPress = () => {
    navigate("RecyclingMap");
  };
  const navigateRecharge = () => {
    navigate("RechargeScreen");
  };

  const navigateSend = () => {
    navigate("SendScreen", { id: "0" });
  };

  const navigateExchange = () => {
    navigate("CanjearScreen");
  };

  const navigateReceive = () => {
    navigate("ReceiveScreen");
  };

  const navigateCollect = () => {
    navigate("CobrarScreen");
  };

  const navigateCommunity = () => {
    navigate("MainTabs", { screen: "Community" });
  };

  const navigateDelivery = () => {
    navigate("MainTabs", { screen: "Catalog" });
  };
  const navigateFaq = () => {
    navigate("FAQ");
  };

  return {
    navigateViewHistory,
    navigateRecyclingMapPress,
    navigateRecharge,
    navigateSend,
    navigateExchange,
    navigateReceive,
    navigateCollect,
    navigateCommunity,
    navigateDelivery,
    navigateFaq,
  };
};
