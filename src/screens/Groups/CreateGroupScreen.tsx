import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import useCreateGroupLogic from "./hooks/useCreateGroupLogic";
import Card from "./components/Card";
import Field from "./components/Field";
import { AddressManagementModal } from "@/screens/DashboardUser/components/settings/AddressManagementModal";
import { ShareGroupModal } from "@/components/shared/ShareGroupModal";
import { useAuth } from "@/context";
import { useCustomNavigation, useNotify } from "@/hooks";
import { Group } from "@/services/GroupApiService";
import {
  Button,
  CustomInput,
  ThemedHeader,
  DatePickerInput,
} from "src/components";
import { useResponsiveLayout } from "@/hooks";

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
    image,
    pickImage,

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
    isValid,
    // Actions
    createGroup,
  } = useCreateGroupLogic();
  const { navigate } = useCustomNavigation();
  // Local UI State
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [createdGroup, setCreatedGroup] = React.useState<Group | null>(null);
  const { isWeb } = useResponsiveLayout();

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
      <ThemedHeader
        canGoBack
        title="Crear Grupo"
        onBackPress={() => navigate("MainTabs", { screen: "Groups" })}
      />

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
            <Card className="gap-2">
              <CustomInput
                variant="filled"
                value={groupName}
                onChangeText={setGroupName}
                label="Nombre del Grupo"
              />
              <DatePickerInput
                value={eventDate}
                onChange={setEventDate}
                label="Fecha y Hora"
              />

              <View className="flex flex-row justify-between items-start gap-2">
                <CustomInput
                  variant="filled"
                  value={description}
                  onChangeText={setDescription}
                  label="Descripción"
                  placeholder="¿De qué trata este evento?"
                />
                <Button
                  title="Cargar imagen"
                  onPress={() => pickImage([16, 9])}
                  icon={
                    <Feather
                      name={image ? "check" : "camera"}
                      size={20}
                      color={image ? "green" : "#f97316"}
                    />
                  }
                  variant="onlyIcon"
                  style={{
                    borderColor: image ? "#00e074" : "#f97316",
                  }}
                />
              </View>
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
                showsHorizontalScrollIndicator={isWeb ? true : false}
                className="mb-6 py-2"
              >
                <View className="flex-row gap-2 pr-4">
                  {groupTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setGroupType(type.id)}
                      className={`px-4 py-2 rounded-full border ${
                        groupType === type.id
                          ? "bg-[#F88D2A] border-[#F88D2A]"
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
                        ? "border-[#F88D2A] bg-primary/5"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        privacy === opt.id ? "bg-[#f88e2ab7]" : "bg-gray-100"
                      }`}
                    >
                      <Feather
                        name={opt.code === "PUBLIC" ? "globe" : "lock"}
                        size={18}
                        color={privacy === opt.id ? "#F88D2A" : "#6B7280"}
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
                          ? "border-[#F88D2A] bg-primary/5"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <View
                        className={`p-2 rounded-lg mr-3 ${isSelected ? "bg-[#f88e2ab7]" : "bg-gray-100"}`}
                      >
                        <Feather
                          name={iconName}
                          size={20}
                          color={isSelected ? "#f88e2ab7" : "#6B7280"}
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
                            ? "border-[#F88D2A] bg-[#F88D2A]"
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
            <Card className="min-h-[350px]">
              <Text className="text-base font-medium mb-3 text-gray-700">
                Dirección
              </Text>

              {userAddresses.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={isWeb ? true : false}
                  className="mb-3 pb-3"
                >
                  <View className="flex-row gap-3 pr-4">
                    {userAddresses.map((addr) => (
                      <TouchableOpacity
                        key={addr.id}
                        onPress={() => setUserAddressId(addr.id)}
                        className={`w-64 p-3 rounded-xl border-2 ${
                          userAddressId === addr.id
                            ? "border-[#F88D2A] bg-primary/5"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <View className="flex-row items-start gap-2">
                          <Feather
                            name="map-pin"
                            size={16}
                            color={
                              userAddressId === addr.id ? "#F88D2A" : "#9CA3AF"
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
              />
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg pb-8">
        <TouchableOpacity
          onPress={handleCreate}
          disabled={isLoading || !isValid}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg transform active:scale-95 transition-all ${
            isLoading ? "bg-[#f88e2a2c]" : "bg-[#F88D2A]"
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
