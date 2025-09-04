import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useOrdersStore } from "../../stores/useOrdersStore";
import OrdersScreen from "../../screens/OrdersScreen";
import OrderDetailScreen from "../../screens/Orders/OrderDetailScreen";

interface MockNavigatorProps {
  children: React.ReactNode;
}

interface Route {
  name: string;
  params?: any;
}

export const MockNavigator: React.FC<MockNavigatorProps> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<Route>({ name: "Main" });
  const { orders } = useOrdersStore();

  const navigate = (routeName: string, params?: any) => {
    setCurrentRoute({ name: routeName, params });
  };

  const goBack = () => {
    setCurrentRoute({ name: "Main" });
  };

  // Mock navigation object
  const mockNavigation = {
    navigate,
    goBack,
    getState: () => ({ routes: [currentRoute] }),
  };

  // Mock route object
  const mockRoute = {
    params: currentRoute.params || {},
  };

  // Provide navigation context to children
  const clonedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as any, {
        navigation: mockNavigation,
      });
    }
    return child;
  });

  const renderCurrentScreen = () => {
    switch (currentRoute.name) {
      case "Orders":
        return (
          <View style={{ flex: 1 }}>
            <OrdersScreen />
          </View>
        );
      case "OrderDetail":
        return (
          <View style={{ flex: 1 }}>
            <OrderDetailScreen />
          </View>
        );
      default:
        return (
          <View style={{ flex: 1 }}>
            {clonedChildren}
            {/* Debug panel */}
            <View
              style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                backgroundColor: "rgba(0,0,0,0.8)",
                padding: 12,
                borderRadius: 8,
                maxWidth: 200,
              }}
            >
              <Text style={{ color: "white", fontSize: 12, marginBottom: 8 }}>
                🐛 Debug Panel
              </Text>
              <TouchableOpacity
                onPress={() => navigate("Orders")}
                style={{
                  backgroundColor: "#FF6B35",
                  padding: 8,
                  borderRadius: 4,
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 12, textAlign: "center" }}
                >
                  Ver Órdenes ({orders.length})
                </Text>
              </TouchableOpacity>
              {orders.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    navigate("OrderDetail", { orderId: orders[0].id })
                  }
                  style={{
                    backgroundColor: "#34C759",
                    padding: 8,
                    borderRadius: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    Ver Última Orden
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
    }
  };

  return <View style={{ flex: 1 }}>{renderCurrentScreen()}</View>;
};
