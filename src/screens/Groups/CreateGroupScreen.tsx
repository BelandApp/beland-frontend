import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import DateTimePicker from "@react-native-community/datetimepicker";

import useCreateGroupLogic from "./hooks/useCreateGroupLogic";
import Card from "./components/Card";
import Field from "./components/Field";
import { AddressManagementModal } from "@/screens/DashboardUser/components/settings/AddressManagementModal";
import { ShareGroupModal } from "@/components/shared/ShareGroupModal";
import { useAuth } from "@/context";
import { useNotify } from "@/hooks";
import { Group } from "@/services/GroupApiService";

export const CreateGroupScreen: React.FC<any> = ({ navigation }) => {
  const notify = useNotify();
  const { user } = useAuth();

  // Logic Hook
  const {
    // Form Values
    groupName,
    groupType,
    description,
    privacy,
    invitationMsg,
    paymentTypeId,
    userAddressId,
    eventDate,

    // Setters
    setGroupName,
    setGroupType,
    setDescription,
    setPrivacy,
    setInvitationMsg,
    setPaymentTypeId,
    setUserAddressId,
    setEventDate,

    // Data Options
    groupTypes,
    privacyOptions,
    paymentTypes,
    userAddresses,
    setUserAddresses,

    // Status
    isLoading,
    isLoadingData,

    // Actions
    createGroup,
  } = useCreateGroupLogic({ navigation });

  // Local UI State
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [createdGroup, setCreatedGroup] = React.useState<Group | null>(null);

  const handleCreate = async () => {
    try {
      const result = await createGroup();
      if (result) {
        setCreatedGroup(result);
        setShowShareModal(true);
        notify.success({
          message: `¡Grupo "${result.name}" creado exitosamente!`,
        });
      }
    } catch (e: any) {
      const errorMsg = e?.message || "Error al crear el grupo";
      notify.error({ message: errorMsg });
    }
  };

  if (isLoadingData) {
    return (
      <View className="flex-1 bg-background-light items-center justify-center">
        <ActivityIndicator size="large" color="#00E074" />
        <Text className="text-gray-500 mt-4 font-medium">
          Cargando configuración...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white shadow-sm z-10">
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          className="mr-3 p-2 bg-gray-50 rounded-full"
        >
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">
          Crear Nuevo Grupo
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-4 pt-6 pb-2">
          {/* Section 1: Basic Info */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
              Información del Evento
            </Text>
            <Card>
              <Field
                label="Nombre del Grupo *"
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Ej. Cumpleaños de Ana"
              />

              <View className="mt-4">
                <Text className="text-base font-medium mb-2 text-gray-700">
                  Fecha y Hora *
                </Text>
                {Platform.OS === "web" ? (
                  <View className="flex-row gap-3">
                    <View className="flex-1 border-2 border-gray-100 rounded-xl bg-gray-50 overflow-hidden flex-row items-center">
                      <View className="pl-3">
                        <Feather name="calendar" size={18} color="#9CA3AF" />
                      </View>
                      <input
                        type="datetime-local"
                        value={
                          eventDate
                            ? new Date(
                                new Date(eventDate).getTime() -
                                  new Date().getTimezoneOffset() * 60000,
                              )
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        onChange={(e) => {
                          const d = new Date(e.target.value);
                          if (!isNaN(d.getTime())) {
                            setEventDate(d.toISOString());
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          fontSize: "14px",
                          color: "#374151",
                          fontFamily: "inherit",
                        }}
                      />
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="flex-row items-center bg-gray-50 border-2 border-gray-100 rounded-xl p-3"
                  >
                    <View className="bg-white p-2 rounded-lg mr-3 shadow-sm">
                      <Feather name="calendar" size={20} color="#00E074" />
                    </View>
                    <View>
                      <Text className="text-xs text-gray-500 font-medium">
                        Fecha de inicio
                      </Text>
                      <Text
                        className={`text-base font-semibold ${eventDate ? "text-gray-800" : "text-gray-400"}`}
                      >
                        {eventDate
                          ? new Date(eventDate).toLocaleString("es-ES", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Seleccionar fecha"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <Field
                label="Descripción"
                value={description}
                onChangeText={setDescription}
                placeholder="¿De qué trata este evento?"
                multiline
                className="mt-4"
              />
            </Card>
          </View>

          {/* Section 2: Configuration */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
              Configuración
            </Text>
            <Card>
              {/* Type Selector */}
              <Text className="text-base font-medium mb-3 text-gray-700">
                Tipo de Grupo
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-6"
              >
                <View className="flex-row gap-2 pr-4">
                  {groupTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setGroupType(type.id)}
                      className={`px-4 py-2 rounded-full border ${
                        groupType === type.id
                          ? "bg-primary border-primary"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          groupType === type.id ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Privacy Selector */}
              <Text className="text-base font-medium mb-3 text-gray-700">
                Privacidad
              </Text>
              <View className="gap-3 mb-6">
                {privacyOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setPrivacy(opt.id)}
                    className={`flex-1 p-3 rounded-xl border flex-row items-center gap-3 ${
                      privacy === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        privacy === opt.id ? "bg-primary/20" : "bg-gray-100"
                      }`}
                    >
                      <Feather
                        name={opt.code === "PUBLIC" ? "globe" : "lock"}
                        size={18}
                        color={privacy === opt.id ? "#00E074" : "#6B7280"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-semibold text-sm ${
                          privacy === opt.id ? "text-gray-900" : "text-gray-600"
                        }`}
                      >
                        {opt.name}
                      </Text>
                      <Text className="text-xs text-gray-400" numberOfLines={1}>
                        {opt.code === "PUBLIC"
                          ? "Visible para todos"
                          : "Solo invitación"}
                      </Text>
                    </View>
                    {privacy === opt.id && (
                      <Feather name="check-circle" size={16} color="#00E074" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Payment Type Selector */}
              <Text className="text-base font-medium mb-3 text-gray-700">
                Método de Pago
              </Text>
              <View className="gap-3">
                {paymentTypes.map((pt) => {
                  const isSelected = paymentTypeId === pt.id;
                  let iconName = "credit-card";
                  if (pt.code === "EQUAL_SPLIT") iconName = "users";
                  if (pt.code === "SPLIT") iconName = "pie-chart";

                  return (
                    <TouchableOpacity
                      key={pt.id}
                      onPress={() => setPaymentTypeId(pt.id)}
                      className={`p-4 rounded-xl border flex-row items-center ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <View
                        className={`p-2 rounded-lg mr-3 ${isSelected ? "bg-primary/20" : "bg-gray-100"}`}
                      >
                        <Feather
                          name={iconName}
                          size={20}
                          color={isSelected ? "#00E074" : "#6B7280"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {pt.code === "EQUAL_SPLIT"
                            ? "División Equitativa"
                            : pt.code === "FULL"
                              ? "Pago Completo (Líder)"
                              : pt.description}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-0.5">
                          {pt.description}
                        </Text>
                      </View>
                      <View
                        className={`w-5 h-5 rounded-full border items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <Feather name="check" size={12} color="white" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          </View>

          {/* Section 3: Location & Invitation */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
              Ubicación y Mensaje
            </Text>
            <Card>
              <Text className="text-base font-medium mb-3 text-gray-700">
                Dirección
              </Text>

              {userAddresses.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                >
                  <View className="flex-row gap-3 pr-4">
                    {userAddresses.map((addr) => (
                      <TouchableOpacity
                        key={addr.id}
                        onPress={() => setUserAddressId(addr.id)}
                        className={`w-64 p-3 rounded-xl border-2 ${
                          userAddressId === addr.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <View className="flex-row items-start gap-2">
                          <Feather
                            name="map-pin"
                            size={16}
                            color={
                              userAddressId === addr.id ? "#00E074" : "#9CA3AF"
                            }
                            className="mt-0.5"
                          />
                          <View className="flex-1">
                            <Text
                              className="font-semibold text-gray-800 text-sm"
                              numberOfLines={1}
                            >
                              {addr.addressLine1}
                            </Text>
                            <Text
                              className="text-xs text-gray-500 mt-1"
                              numberOfLines={2}
                            >
                              {addr.addressLine1}, {addr.city}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      onPress={() => setShowAddressModal(true)}
                      className="w-16 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
                    >
                      <Feather name="plus" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowAddressModal(true)}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50 mb-4"
                >
                  <Feather
                    name="map-pin"
                    size={24}
                    color="#9CA3AF"
                    className="mb-2"
                  />
                  <Text className="text-gray-500 font-medium">
                    Agregar una dirección
                  </Text>
                </TouchableOpacity>
              )}

              <Field
                label="Mensaje de Invitación (Opcional)"
                value={invitationMsg}
                onChangeText={setInvitationMsg}
                placeholder="Escribe un mensaje para tus invitados..."
                multiline
                className="mt-2"
              />
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg pb-8">
        <TouchableOpacity
          onPress={handleCreate}
          disabled={isLoading}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg transform active:scale-95 transition-all ${
            isLoading ? "bg-primary/70" : "bg-primary"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : (
            <Feather name="check" size={20} color="white" className="mr-2" />
          )}
          <Text className="text-white font-bold text-lg">
            {isLoading ? "Creando..." : "Crear Grupo"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddressManagementModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onCreated={(address) => {
          setUserAddressId(address.id);
          setUserAddresses((prev) => [...prev, address]);
          setShowAddressModal(false);
        }}
      />

      {/* Native Date Picker Modal */}
      {Platform.OS !== "web" && showDatePicker && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-white rounded-t-3xl p-6 pb-10">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">
                  Seleccionar Fecha
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <Feather name="x" size={20} color="#374151" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={eventDate ? new Date(eventDate) : new Date()}
                mode="datetime"
                display="spinner"
                onChange={(event, date) => {
                  if (date) setEventDate(date.toISOString());
                }}
                locale="es-ES"
                textColor="#000"
              />
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="mt-6 bg-primary py-4 rounded-2xl shadow-sm"
              >
                <Text className="text-white text-center font-bold text-lg">
                  Confirmar Fecha
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Share Modal */}
      {createdGroup && (
        <ShareGroupModal
          visible={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            navigation?.navigate("MainTabs", {
              screen: "Groups",
              params: { screen: "GroupsList" },
            });
          }}
          groupData={{
            groupName: createdGroup.name,
            groupId: createdGroup.id,
            description: createdGroup.description,
            memberCount: 1,
            creatorName: user?.full_name || user?.username || "Tú",
          }}
        />
      )}
    </View>
  );
};

export default CreateGroupScreen;
