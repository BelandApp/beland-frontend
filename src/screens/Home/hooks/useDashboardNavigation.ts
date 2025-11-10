
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

export const useDashboardNavigation = () => {
  const {navigate}=useCustomNavigation()

  const handleMenuPress = () => {
    // TODO Navegar a configuración
    console.log("Menu pressed");
  };

  const handleViewHistory = () => {
    // Navegar a la pantalla de historial
   navigate("HistoryScreen");
  };

  const handleCoinsPress = () => {
    // Acción para presionar en las monedas
    console.log("Coins pressed");
  };

  const handleRecyclingMapPress = () => {
    // Navegar a la pantalla completa del mapa de reciclaje
    navigate("RecyclingMap");
  };

  return {
    handleMenuPress,
    handleViewHistory,
    handleCoinsPress,
    handleRecyclingMapPress,
  };
};
