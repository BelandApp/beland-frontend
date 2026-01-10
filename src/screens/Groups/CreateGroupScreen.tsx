import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
} from "react-native";

import useCreateGroupLogic from "./hooks/useCreateGroupLogic";
import Card from "./components/Card";
import Field from "./components/Field";
import { AddressManagementModal } from "@/screens/DashboardUser/components/settings/AddressManagementModal";
import { ShareGroupModal } from "@/components/shared/ShareGroupModal";
import Feather from "react-native-vector-icons/Feather";
import {
  GroupService,
  GroupType,
  GroupPrivacy,
  Group,
} from "@/services/GroupApiService";
import { addressService, UserAddress } from "@/services/addressService";
import { useAuth } from "@/context";
import { useNotify } from "@/hooks";
import { ShareGroupData } from "@/utils/shareHelper";
import DateTimePicker from "@react-native-community/datetimepicker";

// Elimina PRIVACY_OPTIONS, ahora se cargan dinámicamente

export const CreateGroupScreen: React.FC<any> = ({ navigation }) => {
  // Estado para tipos de privacidad dinámicos
  const [privacyOptions, setPrivacyOptions] = React.useState<GroupPrivacy[]>(
    []
  );
  const [loadingPrivacy, setLoadingPrivacy] = React.useState(false);

  // Estado para tipos de pago dinámicos
  const [paymentTypes, setPaymentTypes] = React.useState<any[]>([]);
  const [loadingPaymentTypes, setLoadingPaymentTypes] = React.useState(false);

  // Estado para direcciones del usuario
  const [userAddresses, setUserAddresses] = React.useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = React.useState(false);

  // Cargar direcciones del usuario
  React.useEffect(() => {
    let mounted = true;
    setLoadingAddresses(true);
    addressService
      .getUserAddresses()
      .then((addresses: UserAddress[]) => {
        if (mounted) setUserAddresses(addresses);
      })
      .catch(() => setUserAddresses([]))
      .finally(() => setLoadingAddresses(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Cargar tipos de pago desde el backend
  React.useEffect(() => {
    let mounted = true;
    setLoadingPaymentTypes(true);
    GroupService.getPaymentTypes()
      .then((types) => {
        if (mounted) setPaymentTypes(types);
      })
      .catch(() => setPaymentTypes([]))
      .finally(() => setLoadingPaymentTypes(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Cargar tipos de privacidad desde el backend
  React.useEffect(() => {
    let mounted = true;
    setLoadingPrivacy(true);
    GroupService.getGroupPrivacies()
      .then((privs) => {
        if (mounted) {
          setPrivacyOptions(privs);
          // Fijar automáticamente el primer tipo de privacidad como predeterminado
          if (privs && privs.length > 0) {
            setPrivacy(privs[0].id);
          }
        }
      })
      .catch(() => setPrivacyOptions([]))
      .finally(() => setLoadingPrivacy(false));
    return () => {
      mounted = false;
    };
  }, []);
  const logic = useCreateGroupLogic({ navigation });
  const notify = useNotify();
  const { user } = useAuth();

  // Estado para modal de compartir
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [createdGroup, setCreatedGroup] = React.useState<Group | null>(null);

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
        if (mounted) {
          setGroupTypes(arr);
          // Fijar automáticamente el primer tipo de grupo como predeterminado
          if (arr && arr.length > 0) {
            setGroupType(arr[0].id);
          }
        }
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
    deliveryTime,
    isLoading,
    setGroupName,
    setGroupType,
    setDescription,
    setDeliveryTime,
    paymentTypeId,
    setPaymentTypeId,
    userAddressId,
    setUserAddressId,
    createGroup,
    eventDate,
    setEventDate,
  } = logic as any;

  const [privacy, setPrivacy] = React.useState<string>("");
  const [invitationMsg, setInvitationMsg] = React.useState("");
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const handleCreate = async () => {
    // Validar que se haya seleccionado una privacidad
    if (!privacy || privacy.trim() === "") {
      notify.error({ message: "Debes seleccionar un tipo de privacidad" });
      return;
    }

    // Validar que se haya seleccionado un tipo de grupo
    if (!groupType || groupType.trim() === "") {
      notify.error({ message: "Debes seleccionar un tipo de grupo" });
      return;
    }

    // Validar que se haya seleccionado una fecha de evento
    if (!eventDate || eventDate.trim() === "") {
      notify.error({ message: "Debes seleccionar la fecha del evento" });
      return;
    }

    // Validar que la fecha sea futura
    if (new Date(eventDate) <= new Date()) {
      notify.error({ message: "La fecha del evento debe ser futura" });
      return;
    }

    try {
      const result = await createGroup({
        privacy,
        message_invitation: invitationMsg,
        payment_type_id: paymentTypeId,
        group_type_id: groupType,
        user_address_id: userAddressId,
      });
      if (result) {
        // Guardar el grupo creado y mostrar modal de compartir
        setCreatedGroup(result);
        setShowShareModal(true);

        // Mostrar notificación simple de éxito
        notify.success({
          message: `¡Grupo "${result.name}" creado exitosamente!`,
        });
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
            label="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
            placeholder="¿De qué trata este grupo?"
            multiline
            className="mt-4"
          />

          {/* Event Date/Time Field */}
          <View className="mt-4">
            <Text className="text-base font-medium mb-2">
              Fecha y Hora del Evento *
            </Text>
            {Platform.OS === "web" ? (
              // Web: Separate date and time inputs for better UX
              <View>
                <View className="flex-row gap-3">
                  {/* Date Input */}
                  <View className="flex-1">
                    <View className="flex-row items-center border-2 border-gray-300 rounded-xl bg-white overflow-hidden shadow-sm hover:border-primary transition-colors">
                      <View className="px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-r border-gray-200">
                        <Feather name="calendar" size={20} color="#00E074" />
                      </View>
                      <input
                        type="date"
                        value={
                          eventDate
                            ? new Date(eventDate).toISOString().slice(0, 10)
                            : ""
                        }
                        onChange={(e: any) => {
                          const dateValue = e.target.value;
                          if (dateValue) {
                            const currentTime = eventDate
                              ? new Date(eventDate).toISOString().slice(11, 16)
                              : "12:00";
                            setEventDate(
                              new Date(
                                `${dateValue}T${currentTime}`
                              ).toISOString()
                            );
                          }
                        }}
                        min={new Date().toISOString().slice(0, 10)}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          fontSize: "15px",
                          fontWeight: "500",
                          color: "#1f2937",
                          border: "none",
                          outline: "none",
                          minHeight: "48px",
                          cursor: "pointer",
                          backgroundColor: "transparent",
                        }}
                      />
                    </View>
                  </View>

                  {/* Time Input */}
                  <View className="flex-1">
                    <View className="flex-row items-center border-2 border-gray-300 rounded-xl bg-white overflow-hidden shadow-sm hover:border-primary transition-colors">
                      <View className="px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-r border-gray-200">
                        <Feather name="clock" size={20} color="#00E074" />
                      </View>
                      <input
                        type="time"
                        value={
                          eventDate
                            ? (() => {
                                const date = new Date(eventDate);
                                const hours = String(date.getHours()).padStart(
                                  2,
                                  "0"
                                );
                                const minutes = String(
                                  date.getMinutes()
                                ).padStart(2, "0");
                                return `${hours}:${minutes}`;
                              })()
                            : ""
                        }
                        onChange={(e: any) => {
                          const timeValue = e.target.value;
                          if (timeValue && eventDate) {
                            const date = new Date(eventDate);
                            const [hours, minutes] = timeValue.split(":");
                            date.setHours(parseInt(hours, 10));
                            date.setMinutes(parseInt(minutes, 10));
                            setEventDate(date.toISOString());
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          fontSize: "15px",
                          fontWeight: "500",
                          color: "#1f2937",
                          border: "none",
                          outline: "none",
                          minHeight: "48px",
                          cursor: "pointer",
                          backgroundColor: "transparent",
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              // Mobile: TouchableOpacity to open Modal
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="border-2 border-gray-300 rounded-lg bg-white"
              >
                <View className="flex-row items-center">
                  <View className="px-3 py-3 bg-primary/10 border-r border-gray-300">
                    <Feather name="calendar" size={20} color="#00E074" />
                  </View>
                  <View className="flex-1 px-3 py-2">
                    <Text
                      className={
                        eventDate
                          ? "text-gray-900 text-base"
                          : "text-gray-400 text-base"
                      }
                    >
                      {eventDate
                        ? new Date(eventDate).toLocaleString("es-ES", {
                            dateStyle: "full",
                            timeStyle: "short",
                          })
                        : "Selecciona fecha y hora del evento"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Native Modal with DateTimePicker for mobile */}
          {Platform.OS !== "web" && showDatePicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold">
                      Selecciona Fecha y Hora
                    </Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Feather name="x" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <DateTimePicker
                    value={eventDate ? new Date(eventDate) : new Date()}
                    mode="datetime"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setEventDate(selectedDate.toISOString());
                      }
                    }}
                    minimumDate={new Date()}
                    locale="es-ES"
                  />

                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    className="mt-4 bg-primary rounded-xl py-3"
                  >
                    <Text className="text-white text-center font-bold text-base">
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
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
                      name={opt.code === "PUBLIC" ? "unlock" : "lock"}
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
          <Text className="text-base font-medium mb-2 mt-4">Tipo de Pago</Text>
          <View className="flex-row gap-3 flex-wrap">
            {loadingPaymentTypes ? (
              <Text className="text-gray-400">Cargando tipos de pago...</Text>
            ) : Array.isArray(paymentTypes) && paymentTypes.length > 0 ? (
              paymentTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  className={`flex-1 min-w-[45%] p-4 rounded-xl border items-center ${
                    paymentTypeId === type.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 bg-white"
                  }`}
                  onPress={() => setPaymentTypeId(type.id)}
                >
                  <View className="mb-2">
                    <Feather
                      name={
                        type.code === "EQUAL_SPLIT"
                          ? "users"
                          : type.code === "SPLIT"
                          ? "layers"
                          : "credit-card"
                      }
                      size={22}
                      color="#00E074"
                    />
                  </View>
                  <Text
                    className={`font-semibold text-center ${
                      paymentTypeId === type.id
                        ? "text-primary"
                        : "text-gray-700"
                    }`}
                  >
                    {type.code === "EQUAL_SPLIT"
                      ? "Dividida"
                      : type.code === "SPLIT"
                      ? "Por Consumo"
                      : type.code === "FULL"
                      ? "Completo"
                      : type.code}
                  </Text>
                  <Text className="text-xs text-gray-500 text-center mt-1">
                    {type.description}
                  </Text>
                  {paymentTypeId === type.id && (
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
                No hay tipos de pago disponibles
              </Text>
            )}
          </View>
        </Card>
        <Text className="text-lg font-bold text-beland-text-primary mb-2">
          Detalles Adicionales
        </Text>
        <Card className="mb-4">
          <Text className="text-base font-medium mb-2">
            Ubicación del Grupo
          </Text>
          {loadingAddresses ? (
            <Text className="text-gray-400">Cargando direcciones...</Text>
          ) : userAddresses.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 0, gap: 8 }}
            >
              {userAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  className={`p-3 rounded-lg border-2 min-w-[280px] ${
                    userAddressId === addr.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 bg-white"
                  }`}
                  onPress={() => setUserAddressId(addr.id)}
                >
                  <View className="flex-row items-start gap-2">
                    <Feather name="map-pin" size={16} color="#00E074" />
                    <View className="flex-1">
                      <Text
                        className={`font-semibold text-sm ${
                          userAddressId === addr.id
                            ? "text-primary"
                            : "text-gray-800"
                        }`}
                        numberOfLines={1}
                      >
                        {addr.addressLine1}
                      </Text>
                      <Text className="text-xs text-gray-500" numberOfLines={1}>
                        {addr.city}, {addr.country}
                      </Text>
                      {addr.isDefault && (
                        <Text className="text-xs text-green-600 mt-1">
                          Dirección principal
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text className="text-gray-400">
              No hay direcciones registradas
            </Text>
          )}
          <TouchableOpacity
            onPress={() => setShowAddressModal(true)}
            className="mt-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary flex-row items-center justify-center gap-2"
          >
            <Feather name="plus" size={18} color="#00E074" />
            <Text className="font-semibold text-primary">
              Agregar Dirección
            </Text>
          </TouchableOpacity>
          <Field
            label="Mensaje de Invitación (opcional)"
            value={invitationMsg}
            onChangeText={setInvitationMsg}
            placeholder="¡Hola! Te invito a unirte a mi grupo..."
            multiline
            className="mt-4"
          />
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
      {/* Modal para gestionar direcciones */}
      <AddressManagementModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onCreated={(address) => {
          setUserAddressId(address.id);
          setUserAddresses((prev) => [...prev, address]);
          setShowAddressModal(false);
        }}
      />

      {/* Modal para compartir grupo */}
      {createdGroup && (
        <ShareGroupModal
          visible={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            // Navegar a la lista de grupos después de cerrar
            navigation?.navigate("MainTabs", {
              screen: "Groups",
              params: { screen: "GroupsList" },
            });
          }}
          groupData={{
            groupName: createdGroup.name,
            groupId: createdGroup.id,
            description: createdGroup.description,
            memberCount: 1, // El creador es el primer miembro
            creatorName:
              user?.full_name || user?.username || user?.email || "Tú",
          }}
        />
      )}
    </View>
  );
};

export default CreateGroupScreen;
