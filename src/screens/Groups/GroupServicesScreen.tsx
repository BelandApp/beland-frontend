import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ServicesApiService, Service } from "@/services/ServicesApiService";
import { useNotify } from "@/hooks";

interface GroupServicesScreenProps {
  groupId: string;
  isGroupLeader?: boolean;
  onServiceSelect?: (service: Service) => void;
}

export const GroupServicesScreen: React.FC<GroupServicesScreenProps> = ({
  groupId,
  isGroupLeader = false,
  onServiceSelect,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const notifyContext = useNotify();

  // Load services
  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ServicesApiService.getServices();
      // Filter only active services
      const activeServices = data.filter((service) => service.is_active);
      setServices(activeServices);
    } catch (error) {
      console.error("Error loading services:", error);
      notifyContext.error({
        message: "Error al cargar servicios",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh services
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await ServicesApiService.getServices();
      const activeServices = data.filter((service) => service.is_active);
      setServices(activeServices);
    } catch (error) {
      console.error("Error refreshing services:", error);
      notifyContext.error({
        message: "Error al actualizar servicios",
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Service Card Component
  const ServiceCard = ({ service }: { service: Service }) => {
    const handlePress = () => {
      if (isGroupLeader && onServiceSelect) {
        onServiceSelect(service);
      }
    };

    const price = service.price || 0;
    const priceLabel = "USD";

    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={!isGroupLeader || !onServiceSelect}
        className={`mx-4 mb-4 rounded-2xl overflow-hidden ${
          isGroupLeader
            ? "bg-white border-2 border-orange-400"
            : "bg-white border border-gray-200"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        {/* Image Section */}
        <View className="relative h-48 bg-gray-100 overflow-hidden">
          {service.image_url ? (
            <Image
              source={{ uri: service.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
              <MaterialCommunityIcons
                name="shopping-outline"
                size={60}
                color="#6BA43A"
              />
            </View>
          )}

          {/* Status Badge */}
          <View className="absolute top-3 right-3 bg-green-500 rounded-full px-3 py-1 flex-row items-center gap-1">
            <MaterialCommunityIcons
              name="check-circle"
              size={14}
              color="white"
            />
            <Text className="text-white text-xs font-semibold">Disponible</Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="p-4">
          {/* Service Name */}
          <Text className="text-lg font-bold text-gray-900 mb-1 leading-tight">
            {service.name}
          </Text>

          {/* Description */}
          <Text
            className="text-sm text-gray-600 mb-3 leading-5"
            numberOfLines={2}
          >
            {service.description}
          </Text>

          {/* Price Section */}
          <View className="bg-gradient-to-r from-green-50 to-orange-50 rounded-lg p-3 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="currency-usd"
                size={20}
                color="#F88D2A"
              />
              <View>
                <Text className="text-xs text-gray-600 font-medium">
                  Precio
                </Text>
                <Text className="text-lg font-bold text-gray-900">
                  {typeof price === "number" ? price.toFixed(2) : price}
                </Text>
              </View>
            </View>
            <Text className="text-xs font-semibold text-gray-700">
              {priceLabel}
            </Text>
          </View>

          {/* CTA Button */}
          {isGroupLeader && onServiceSelect && (
            <TouchableOpacity
              onPress={handlePress}
              className="bg-green-500 rounded-lg py-2.5 flex-row items-center justify-center gap-2 active:bg-green-600"
            >
              <MaterialCommunityIcons
                name="plus-circle"
                size={18}
                color="white"
              />
              <Text className="text-white font-semibold text-sm">
                Contratar servicio
              </Text>
            </TouchableOpacity>
          )}

          {/* View Only Mode */}
          {!isGroupLeader && (
            <View className="bg-gray-100 rounded-lg py-2.5 flex-row items-center justify-center gap-2 opacity-60">
              <MaterialCommunityIcons name="lock" size={16} color="#666" />
              <Text className="text-gray-600 font-medium text-xs">
                Solo el líder puede contratar
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Empty State
  if (!loading && services.length === 0) {
    return (
      <View className="flex-1 bg-white flex items-center justify-center px-4">
        <View className="mb-6">
          <MaterialCommunityIcons name="inbox-outline" size={80} color="#CCC" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          Sin servicios disponibles
        </Text>
        <Text className="text-center text-gray-600 text-sm leading-5">
          En este momento no hay servicios disponibles para contratar.
        </Text>
      </View>
    );
  }

  // Loading State
  if (loading) {
    return (
      <View className="flex-1 bg-white flex items-center justify-center">
        <ActivityIndicator size="large" color="#6BA43A" />
        <Text className="mt-4 text-gray-600 font-medium">
          Cargando servicios...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Servicios</Text>
        <Text className="text-sm text-gray-600 mt-1">
          {services.length} servicio{services.length !== 1 ? "s" : ""}{" "}
          disponible
          {services.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Services List */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ServiceCard service={item} />}
        contentContainerStyle={{ paddingVertical: 12 }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6BA43A"]}
            tintColor="#6BA43A"
          />
        }
      />
    </View>
  );
};

export default GroupServicesScreen;
