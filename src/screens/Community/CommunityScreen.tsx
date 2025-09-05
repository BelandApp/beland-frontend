import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../components/layout/RootStackNavigator";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { colors } from "../../styles/colors";
import { Resource } from "../../types/resource";
import { resourceService } from "../../services/resourceService";
import { walletService } from "../../services/walletService";
import { useCustomAlert } from "../../hooks/useCustomAlert";
import { useUserBalance } from "../../hooks/useUserBalance";
import { calculateResourcePrice } from "../../utils/priceHelpers";

// Components
import {
  CommunityHeader,
  ResourcesGrid,
  InsufficientBalanceModal,
} from "./components";
import { PurchaseModal } from "./components/PurchaseModal";

// Styles
import { containerStyles } from "./styles";

export const CommunityScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Estado para recursos
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Estado para modal de compra
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [insufficientBalanceModalVisible, setInsufficientBalanceModalVisible] =
    useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );

  // Hooks personalizados
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();
  const { balance, refetch: refetchBalance } = useUserBalance();

  // Cargar recursos
  const loadResources = async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      }

      const response = await resourceService.getResources({
        page: pageNum,
        limit: 20,
      });

      if (reset || pageNum === 1) {
        setResources(response.resources);
      } else {
        setResources((prev) => [...prev, ...response.resources]);
      }

      setHasMore(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error cargando recursos:", error);
      showCustomAlert(
        "Error",
        "No se pudieron cargar los recursos. Inténtalo de nuevo.",
        "error"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Efectos
  useEffect(() => {
    loadResources(1, true);
  }, []);

  // Manejar refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadResources(1, true);
  };

  // Manejar cargar más
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadResources(page + 1, false);
    }
  };

  // Función para manejar la compra con modal
  const handlePurchasePress = async (resource: Resource) => {
    // Refrescar el balance antes de validar para tener datos actualizados
    await refetchBalance();

    setSelectedResource(resource);

    // Calcular el precio del recurso para validar saldo
    const priceCalc = calculateResourcePrice(resource);
    const minQuantity = 1;
    const totalPrice = priceCalc.finalPrice * minQuantity;

    // Verificar si tiene saldo suficiente para al menos 1 unidad
    if (balance < totalPrice) {
      // Mostrar modal de saldo insuficiente
      setInsufficientBalanceModalVisible(true);
    } else {
      // Mostrar modal de compra normal
      setPurchaseModalVisible(true);
    }
  };

  // Función para cerrar el modal
  const handleModalClose = () => {
    setPurchaseModalVisible(false);
    setSelectedResource(null);
  };

  // Función para cerrar el modal de saldo insuficiente
  const handleInsufficientBalanceModalClose = () => {
    setInsufficientBalanceModalVisible(false);
    setSelectedResource(null);
  };

  // Función para navegar a la pantalla de recarga desde el modal de saldo insuficiente
  const handleNavigateToRechargeFromInsufficientBalance = () => {
    setInsufficientBalanceModalVisible(false);
    setSelectedResource(null);
    navigation.navigate("RechargeScreen");
  };

  // Función para navegar a la pantalla de recarga
  const handleNavigateToRecharge = () => {
    navigation.navigate("RechargeScreen");
  };

  // Función para confirmar la compra desde el modal
  const handlePurchaseConfirm = async (quantity: number) => {
    if (!selectedResource) return;

    try {
      // Calcular el precio con descuento usando la utilidad
      const priceCalc = calculateResourcePrice(selectedResource);
      const response = await walletService.purchaseResource(
        selectedResource.id,
        quantity
      );
      console.log("[BACKEND RESPUESTA COMPRA]", response);

      // Verificar si la respuesta es null o undefined
      if (!response) {
        console.warn(
          "⚠️ Backend devolvió null - posible problema de saldo o stock"
        );
        showCustomAlert(
          "Error en la compra",
          "No se pudo completar la compra. Verifica tu saldo y que el producto tenga stock disponible.",
          "error"
        );
        return;
      }

      const totalCost = priceCalc.finalPrice * quantity;

      showCustomAlert(
        "¡Compra Exitosa!",
        `Has comprado ${quantity} ${selectedResource.resource_name} exitosamente`,
        "success"
      );

      // Actualizar el balance del usuario desde el backend
      await refetchBalance();

      // Recargar recursos para actualizar stock
      loadResources(1, true);

      // Cerrar el modal
      handleModalClose();
    } catch (error: any) {
      console.error("Error comprando recurso:", error);

      let errorMessage = "No se pudo completar la compra. Inténtalo de nuevo.";

      // Manejar diferentes tipos de errores del servidor
      if (error.status === 400) {
        errorMessage = "Saldo insuficiente o parámetros inválidos.";
      } else if (error.status === 404) {
        errorMessage = "Recurso no encontrado.";
      } else if (error.status === 409) {
        // Error de conflicto - puede ser stock insuficiente o recurso no disponible
        errorMessage =
          error.body?.message ||
          error.body?.error ||
          "Stock insuficiente o recurso no disponible en este momento.";
      } else if (error.status === 403) {
        errorMessage = "No tienes permisos para realizar esta compra.";
      } else if (error.status >= 500) {
        errorMessage = "Error del servidor. Por favor, inténtalo más tarde.";
      } else if (error.body?.message) {
        // Si el backend envía un mensaje específico, usarlo
        errorMessage = error.body.message;
      } else if (error.body?.error) {
        // Si el backend envía un error específico, usarlo
        errorMessage = error.body.error;
      }

      showCustomAlert("Error en la compra", errorMessage, "error");
    }
  };

  if (loading && resources.length === 0) {
    return (
      <View
        style={[
          containerStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textPrimary }}>
          Cargando recursos...
        </Text>
      </View>
    );
  }

  return (
    <View style={containerStyles.container}>
      <CommunityHeader balance={balance} />

      <ScrollView
        style={containerStyles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        onMomentumScrollEnd={(event) => {
          const { layoutMeasurement, contentOffset, contentSize } =
            event.nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 100;
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
      >
        <ResourcesGrid
          resources={resources}
          onPurchase={handlePurchasePress}
          loading={loading && page > 1}
        />

        {loading && page > 1 && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ marginTop: 8, color: colors.textPrimary }}>
              Cargando más recursos...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Alertas */}
      {showAlert && (
        <CustomAlert
          visible={showAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={hideAlert}
        />
      )}

      {/* Modal de compra */}
      <PurchaseModal
        visible={purchaseModalVisible}
        resource={selectedResource}
        userBalance={balance}
        onConfirm={handlePurchaseConfirm}
        onCancel={handleModalClose}
        onNavigateToRecharge={handleNavigateToRecharge}
      />

      {/* Modal de saldo insuficiente */}
      <InsufficientBalanceModal
        visible={insufficientBalanceModalVisible}
        userBalance={balance}
        requiredAmount={
          selectedResource
            ? calculateResourcePrice(selectedResource).finalPrice
            : 0
        }
        onRecharge={handleNavigateToRechargeFromInsufficientBalance}
        onCancel={handleInsufficientBalanceModalClose}
      />
    </View>
  );
};
