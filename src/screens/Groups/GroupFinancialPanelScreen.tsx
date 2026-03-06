import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { GroupService } from "src/services/groups/GroupApiService";
import { useNotify } from "@/hooks";
import { CustomLoader } from "@/components/shared/loader/Loader";

interface MemberFinancialSummary {
  user_id: string;
  user_name: string;
  total_spent: number;
  total_paid: number;
  pending_payment: number;
  orders_count: number;
}

interface GroupFinancialData {
  total_spent: number;
  total_paid: number;
  total_pending: number;
  members_summary: MemberFinancialSummary[];
  orders_count: number;
  services_count: number;
}

const GroupFinancialPanelScreenComponent = () => {
  const navigation = useNavigation();
  const route =
    useRoute<
      RouteProp<{ params: { groupId: string; groupName?: string } }, "params">
    >();
  const groupId = (route.params as any)?.groupId;
  const groupName = (route.params as any)?.groupName || "Grupo";

  const [financialData, setFinancialData] = useState<GroupFinancialData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const notifyContext = useNotify();

  const loadFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Conectar con API real cuando esté disponible
      // const data = await GroupService.getGroupFinancialSummary(groupId);
      // setFinancialData(data);
      setFinancialData(null);
    } catch (error) {
      console.error("Error loading financial data:", error);
      notifyContext.error({
        message: "Error al cargar datos financieros",
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, notifyContext]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Conectar con API real
      setFinancialData(null);
    } catch (error) {
      console.error("Error refreshing financial data:", error);
      notifyContext.error({
        message: "Error al actualizar datos",
      });
    } finally {
      setRefreshing(false);
    }
  }, [groupId, notifyContext]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  const windowHeight = Dimensions.get("window").height;
  const scrollHeight = Math.max(420, windowHeight - 180);

  const getTotalPendingPercentage = () => {
    if (!financialData || financialData.total_spent === 0) return 0;
    return (financialData.total_pending / financialData.total_spent) * 100;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={{
              padding: 8,
              backgroundColor: "#f3f4f6",
              borderRadius: 8,
            }}
          >
            <Feather name="arrow-left" size={24} color="#6BA43A" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              Panel Financiero
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Grupo: {groupName}
            </Text>
          </View>
        </View>
      </View>

      {/* Contenido */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <CustomLoader />
        </View>
      ) : !financialData || Object.keys(financialData).length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <MaterialCommunityIcons
            name="chart-box-outline"
            size={80}
            color="#CCC"
          />
          <Text className="text-xl font-bold text-gray-900 mt-4">
            Sin datos
          </Text>
          <Text className="text-gray-600 text-sm mt-2">
            No hay información financiera disponible
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6BA43A"]}
              tintColor="#6BA43A"
            />
          }
          style={
            Platform.OS === "web"
              ? ({ height: scrollHeight, overflow: "auto" } as any)
              : { flex: 1 }
          }
        >
          {/* Resumen General */}
          <View className="px-4 py-4 gap-3">
            {/* Total Gastado */}
            <View className="bg-white rounded-2xl p-5 border border-green-200">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="bg-green-100 p-3 rounded-lg">
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={24}
                    color="#22C55E"
                  />
                </View>
                <Text className="text-sm text-gray-600 font-medium">
                  TOTAL GASTADO
                </Text>
              </View>
              <Text className="text-4xl font-bold text-green-900">
                BsF {financialData.total_spent.toFixed(2)}
              </Text>
              <Text className="text-xs text-gray-600 mt-2">
                {financialData.orders_count} órdenes +{" "}
                {financialData.services_count} servicios
              </Text>
            </View>

            {/* Pagado vs Pendiente */}
            <View className="flex-row gap-3">
              {/* Pagado */}
              <View className="flex-1 bg-white rounded-2xl p-4 border border-green-200">
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#22C55E"
                  />
                  <Text className="text-xs text-gray-600 font-medium">
                    PAGADO
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-green-900">
                  BsF {financialData.total_paid.toFixed(2)}
                </Text>
                <Text className="text-xs text-gray-600 mt-2">
                  {(
                    (financialData.total_paid / financialData.total_spent) *
                    100
                  ).toFixed(0)}
                  % completado
                </Text>
              </View>

              {/* Pendiente */}
              <View className="flex-1 bg-white rounded-2xl p-4 border border-orange-200">
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={20}
                    color="#F88D2A"
                  />
                  <Text className="text-xs text-gray-600 font-medium">
                    PENDIENTE
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-orange-900">
                  BsF {financialData.total_pending.toFixed(2)}
                </Text>
                <Text className="text-xs text-gray-600 mt-2">
                  {getTotalPendingPercentage().toFixed(0)}% por pagar
                </Text>
              </View>
            </View>

            {/* Progreso de Pago */}
            <View className="bg-white rounded-2xl p-5 border border-gray-200">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-bold text-gray-900">
                  Progreso General
                </Text>
                <Text className="text-sm font-semibold text-green-600">
                  {(
                    (financialData.total_paid / financialData.total_spent) *
                    100
                  ).toFixed(0)}
                  %
                </Text>
              </View>

              {/* Progress Bar */}
              <View className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                <View
                  className="h-full bg-gradient-to-r from-green-500 to-green-600"
                  style={{
                    width: `${
                      (financialData.total_paid / financialData.total_spent) *
                      100
                    }%`,
                  }}
                />
              </View>

              <View className="flex-row justify-between text-xs text-gray-600">
                <Text>Pagado: BsF {financialData.total_paid.toFixed(2)}</Text>
                <Text>Total: BsF {financialData.total_spent.toFixed(2)}</Text>
              </View>
            </View>

            {/* Desglose por Miembro */}
            <View className="bg-white rounded-2xl p-5 border border-gray-200">
              <View className="flex-row items-center gap-2 mb-4">
                <MaterialCommunityIcons
                  name="account-multiple-outline"
                  size={20}
                  color="#6BA43A"
                />
                <Text className="text-lg font-bold text-gray-900">
                  Desglose por Miembro
                </Text>
              </View>

              {financialData.members_summary.length === 0 ? (
                <Text className="text-sm text-gray-600 text-center py-4">
                  Sin miembros
                </Text>
              ) : (
                <View className="gap-3">
                  {financialData.members_summary.map((member) => (
                    <View
                      key={member.user_id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      {/* Nombre y órdenes */}
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-semibold text-gray-900">
                          {member.user_name}
                        </Text>
                        <Text className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {member.orders_count} órdenes
                        </Text>
                      </View>

                      {/* Gastado vs Pagado */}
                      <View className="flex-row gap-2 mb-2">
                        <View className="flex-1">
                          <Text className="text-xs text-gray-600 mb-1">
                            Gastado
                          </Text>
                          <Text className="text-sm font-bold text-gray-900">
                            BsF {member.total_spent.toFixed(2)}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs text-gray-600 mb-1">
                            Pagado
                          </Text>
                          <Text className="text-sm font-bold text-green-600">
                            BsF {member.total_paid.toFixed(2)}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs text-gray-600 mb-1">
                            Pendiente
                          </Text>
                          <Text className="text-sm font-bold text-orange-600">
                            BsF {member.pending_payment.toFixed(2)}
                          </Text>
                        </View>
                      </View>

                      {/* Mini Progress Bar */}
                      {member.total_spent > 0 && (
                        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <View
                            className="h-full bg-green-500"
                            style={{
                              width: `${
                                (member.total_paid / member.total_spent) * 100
                              }%`,
                            }}
                          />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Información adicional */}
            <View className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
              <View className="flex-row items-start gap-3">
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color="#0066CC"
                />
                <View className="flex-1">
                  <Text className="font-semibold text-blue-900 text-sm mb-1">
                    Nota Importante
                  </Text>
                  <Text className="text-xs text-blue-800 leading-4">
                    Este panel muestra un resumen de los gastos y pagos del
                    grupo. Todos los miembros pueden ver esta información.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export { GroupFinancialPanelScreenComponent as GroupFinancialPanelScreen };
export default GroupFinancialPanelScreenComponent;
