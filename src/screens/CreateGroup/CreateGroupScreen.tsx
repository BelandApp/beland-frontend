import React from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { AddressMapPicker } from "@/components";
import useCreateGroupLogic from "./hooks/useCreateGroupLogic";
import NewHeader from "./components/Header";

const CreateGroupScreen: React.FC<any> = ({ navigation }) => {
  const logic = useCreateGroupLogic({ navigation });
  const {
    groupName,
    location = "",
    locationUrl,
    deliveryTime,
    isLoading,
    setGroupName,
    setLocation,
    setLocationUrl,
    setDeliveryTime,
    createGroup,
  } = logic as any;

  const [showLocationModal, setShowLocationModal] = React.useState(false);
  const handleCreate = () => createGroup();

  const { width } = useWindowDimensions();
  const isLarge = width > 900;

  return (
    <View className="flex-1 bg-background-light">
      <NewHeader
        title="Crear Nuevo Grupo"
        subtitle="Define los detalles, participantes y gastos iniciales."
        onBack={() => navigation?.goBack?.()}
      />
      <ScrollView
        className="flex-1 w-full max-w-[800px] mx-auto px-4 py-8"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Platform.OS === "android" ? 96 : 86,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[800px] mx-auto px-2">
          <View className="bg-surface-light rounded-2xl p-6 shadow-soft border border-beland-border">
            <Text className="text-2xl font-extrabold text-beland-green-500 mb-1">
              Crear nuevo grupo
            </Text>
            <Text className="text-sm text-beland-text-secondary mb-4">
              Define un nombre, ubicación y (opcional) fecha para convocar al
              grupo.
            </Text>

            <Text className="text-sm text-beland-text-primary mb-2">
              Nombre del grupo
            </Text>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Ej: Grupo de Vecinos"
              className="bg-background-primary rounded-md px-3 py-3 mb-4 border border-beland-border"
            />

            <Text className="text-sm text-beland-text-primary mb-2">
              Ubicación
            </Text>
            <TouchableOpacity
              onPress={() => setShowLocationModal(true)}
              className="bg-background-primary rounded-md px-3 py-3 mb-4 border border-beland-border"
            >
              <Text className="text-beland-text-primary">
                {location && location.length > 0
                  ? location
                  : "Selecciona una ubicación en el mapa"}
              </Text>
              {locationUrl ? (
                <Text className="text-xs text-beland-green-400 mt-1">
                  Enlace de ubicación disponible
                </Text>
              ) : null}
            </TouchableOpacity>

            <Text className="text-sm text-beland-text-primary mb-2">
              Fecha (opcional)
            </Text>
            <TextInput
              value={deliveryTime}
              onChangeText={setDeliveryTime}
              placeholder="YYYY-MM-DDTHH:MM:SSZ"
              className="bg-background-primary rounded-md px-3 py-3 mb-6 border border-beland-border"
            />

            <TouchableOpacity
              onPress={handleCreate}
              disabled={isLoading}
              className={`rounded-md px-4 py-3 ${
                isLoading ? "opacity-60" : ""
              } bg-beland-green-500`}
            >
              <Text className="text-white text-center font-semibold">
                {isLoading ? "Creando..." : "Crear Grupo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <AddressMapPicker
        visible={showLocationModal}
        initial={
          location && typeof location === "string" && location.includes(",")
            ? {
                latitude: parseFloat(location.split(",")[0]),
                longitude: parseFloat(location.split(",")[1]),
              }
            : null
        }
        onSelect={(coords) => {
          const lat = coords.latitude;
          const lon = coords.longitude;
          setLocation(`${lat},${lon}`);
          // set a generic Google Maps link as location_url
          setLocationUrl(
            `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
          );
          setShowLocationModal(false);
        }}
        onClose={() => setShowLocationModal(false)}
      />
    </View>
  );
};

export default CreateGroupScreen;
