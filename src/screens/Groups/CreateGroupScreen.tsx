import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import useCreateGroupLogic from "./hooks/useCreateGroupLogic";
import Card from "./components/Card";
import Field from "./components/Field";
import { AddressMapPicker } from "@/components/shared/maps/AddressMapPicker";
import { reverseGeocode } from "@/services/mapboxService";
import Feather from "react-native-vector-icons/Feather";
import {
  GroupService,
  GroupType,
  GroupPrivacy,
} from "@/services/GroupApiService";

import { useNotify } from "@/hooks";

// Elimina PRIVACY_OPTIONS, ahora se cargan dinámicamente

export const CreateGroupScreen: React.FC<any> = ({ navigation }) => {
  // Estado para tipos de privacidad dinámicos
  const [privacyOptions, setPrivacyOptions] = React.useState<GroupPrivacy[]>(
    []
  );
  const [loadingPrivacy, setLoadingPrivacy] = React.useState(false);
  // Cargar tipos de privacidad desde el backend
  React.useEffect(() => {
    let mounted = true;
    setLoadingPrivacy(true);
    GroupService.getGroupPrivacies()
      .then((privs) => {
        if (mounted) setPrivacyOptions(privs);
      })
      .catch(() => setPrivacyOptions([]))
      .finally(() => setLoadingPrivacy(false));
    return () => {
      mounted = false;
    };
  }, []);
  const logic = useCreateGroupLogic({ navigation });
  const notify = useNotify();

  // Estado para tipos de grupo dinámicos
  const [groupTypes, setGroupTypes] = React.useState<GroupType[]>([]);
  const [loadingGroupTypes, setLoadingGroupTypes] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    setLoadingGroupTypes(true);
    GroupService.getGroupTypes()
      .then((types) => {
        // Si la respuesta es un array anidado, extraer el primer elemento
        const arr =
          Array.isArray(types) && Array.isArray(types[0]) ? types[0] : types;
        if (mounted) setGroupTypes(arr);
      })
      .catch(() => setGroupTypes([]))
      .finally(() => setLoadingGroupTypes(false));
    return () => {
      mounted = false;
    };
  }, []);
  const {
    groupName,
    groupType,
    description,
    location = "",
    locationUrl,
    deliveryTime,
    isLoading,
    setGroupName,
    setGroupType,
    setDescription,
    setLocation,
    setLocationUrl,
    setDeliveryTime,
    createGroup,
  } = logic as any;

  const [privacy, setPrivacy] = React.useState<string>("");
  const [invitationMsg, setInvitationMsg] = React.useState("");
  const [showLocationModal, setShowLocationModal] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLabel, setLocationLabel] = React.useState<string>("");

  const handleCreate = async () => {
    try {
      const result = await createGroup({
        privacy,
        message_invitation: invitationMsg,
      });
      if (result) {
        notify.success({ message: "¡Grupo creado exitosamente!" });
        setTimeout(() => {
          navigation?.navigate("MainTabs", {
            screen: "Groups",
            params: { screen: "GroupsList" },
          });
        }, 100);
      }
    } catch (e) {
      let errorMsg = "Error al crear el grupo";
      if (
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof e.message === "string"
      ) {
        errorMsg = e.message;
      }
      notify.error({ message: errorMsg });
    }
  };

  // Manejar selección de ubicación y obtener dirección legible
  const handleLocationSelect = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setSelectedLocation(coords);
    setLocation(`${coords.latitude},${coords.longitude}`);
    setLocationLabel("Cargando dirección...");
    try {
      const place = await reverseGeocode(coords.latitude, coords.longitude);
      setLocationLabel(
        place?.full_address || `${coords.latitude},${coords.longitude}`
      );
    } catch {
      setLocationLabel(`${coords.latitude},${coords.longitude}`);
    }
  };

  return (
    <View className="flex-1 bg-background-light">
      {/* Header con título y botón de volver */}
      <View className="flex-row items-center px-4 py-4 bg-white shadow-md">
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          className="mr-4 p-2 border-2 border-green-500 rounded-full"
        >
          <Feather name="arrow-left" size={24} color="#00E074" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-beland-text-primary">
          Crear grupo
        </Text>
      </View>
      <View className="px-4 pt-8 pb-2">
        <Text className="text-lg font-bold text-beland-text-primary mb-2">
          Información Básica
        </Text>
        <Card className="mb-4">
          <Field
            label="Nombre del Grupo *"
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Ej. Club de Lectura"
          />
          <Field
            label="Descripción *"
            value={description}
            onChangeText={setDescription}
            placeholder="¿De qué trata este grupo?"
            multiline
            className="mt-4"
          />
        </Card>
        <Text className="text-lg font-bold text-beland-text-primary mb-2">
          Configuración
        </Text>
        <Card className="mb-4">
          <Text className="text-base font-medium mb-2">Tipo de Grupo</Text>
          <View className="mb-4">
            {loadingGroupTypes ? (
              <Text className="text-gray-400">Cargando tipos de grupo...</Text>
            ) : Array.isArray(groupTypes) && groupTypes.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {groupTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    className={`px-4 py-2 rounded-xl border ${
                      groupType === type.id
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 bg-white"
                    }`}
                    onPress={() => setGroupType(type.id)}
                  >
                    <Text
                      className={`font-semibold ${
                        groupType === type.id ? "text-primary" : "text-gray-700"
                      }`}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text className="text-gray-400">
                No hay tipos de grupo disponibles
              </Text>
            )}
          </View>
          <Text className="text-base font-medium mb-2">Privacidad</Text>
          <View className="flex-row gap-3">
            {loadingPrivacy ? (
              <Text className="text-gray-400">
                Cargando tipos de privacidad...
              </Text>
            ) : Array.isArray(privacyOptions) && privacyOptions.length > 0 ? (
              privacyOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  className={`flex-1 p-4 rounded-xl border items-center ${
                    privacy === opt.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 bg-white"
                  }`}
                  onPress={() => setPrivacy(opt.id)}
                >
                  <View className="mb-2">
                    <Feather
                      name={opt.code === "public" ? "globe" : "lock"}
                      size={22}
                      color="#00E074"
                    />
                  </View>
                  <Text
                    className={`font-semibold ${
                      privacy === opt.id ? "text-primary" : "text-gray-700"
                    }`}
                  >
                    {opt.name}
                  </Text>
                  <Text className="text-xs text-gray-500 text-center mt-1">
                    {opt.description}
                  </Text>
                  {privacy === opt.id && (
                    <Feather
                      name="check-circle"
                      size={18}
                      color="#00E074"
                      style={{ position: "absolute", top: 8, right: 8 }}
                    />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-gray-400">
                No hay tipos de privacidad disponibles
              </Text>
            )}
          </View>
        </Card>
        <Text className="text-lg font-bold text-beland-text-primary mb-2">
          Detalles Adicionales
        </Text>
        <Card className="mb-4">
          <Field
            label="Mensaje de Invitación"
            value={invitationMsg}
            onChangeText={setInvitationMsg}
            placeholder="¡Hola! Te invito a unirte a mi grupo..."
            multiline
          />
          <Text className="text-base font-medium mt-4 mb-2">Ubicación</Text>
          <TouchableOpacity
            onPress={() => setShowLocationModal(true)}
            className=" h-16 rounded-xl border-2 border-primary/60 px-3 justify-center bg-white flex-row items-center shadow-soft"
          >
            <Feather
              name="map-pin"
              size={18}
              color="#00E074"
              style={{ marginRight: 8 }}
            />
            <Text
              className={
                locationLabel || location
                  ? "text-beland-text-primary"
                  : "text-green-500 font-bold"
              }
            >
              {locationLabel || (location ? location : "Añadir ubicación")}
            </Text>
          </TouchableOpacity>
        </Card>
      </View>
      <TouchableOpacity
        onPress={handleCreate}
        disabled={isLoading}
        className={`m-4 rounded-xl h-12 flex-row items-center justify-center bg-primary ${
          isLoading ? "opacity-60" : ""
        }`}
      >
        <Text className="text-white font-bold text-base">
          {isLoading ? "Creando..." : "Crear Grupo"}
        </Text>
      </TouchableOpacity>
      {/* Modal de selección de ubicación con Mapbox */}
      <AddressMapPicker
        visible={showLocationModal}
        initial={selectedLocation ?? undefined}
        onSelect={handleLocationSelect}
        onClose={() => setShowLocationModal(false)}
      />
    </View>
  );
};

export default CreateGroupScreen;
