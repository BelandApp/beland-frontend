import React from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import { AddressMapPicker } from "../Catalog/components/AddressMapPicker";
import useCreateGroupLogic from "./hooks/useCreateGroupLogic";
import NewBasicInfo from "./components/BasicInfo";
import NewParticipants from "./components/Participants";
import NewProducts from "./components/Products";
import NewSummary from "./components/Summary";
import NewHeader from "./components/Header";

const CreateGroupScreen: React.FC<any> = ({ navigation }) => {
  const logic = useCreateGroupLogic({ navigation });
  const {
    groupName,
    groupType,
    description,
    location = "",
    deliveryTime,
    participants,
    newParticipantName,
    newParticipantInstagram,
    products,
    splitType,
    isLoading,
    setGroupName,
    setGroupType,
    setDescription,
    setLocation,
    setDeliveryTime,
    setNewParticipantName,
    setNewParticipantInstagram,
    setSplitType,
    addParticipant,
    removeParticipant,
    addProduct,
    updateProduct,
    removeProduct,
    createGroup,
    totals,
  } = logic;

  const [showLocationModal, setShowLocationModal] = React.useState(false);
  const handleCreate = () => {
    createGroup();
  };

  const { width } = useWindowDimensions();
  const isLarge = width > 900;

  return (
    <View className="flex-1 bg-[#f6f6f2]">
      <NewHeader
        title="Crear Nuevo Grupo"
        subtitle="Define los detalles, participantes y gastos iniciales."
        onBack={() => navigation?.goBack?.()}
      />
      <ScrollView
        className="flex-1 w-full max-w-[1200px] mx-auto px-2 md:px-8 py-8"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Platform.OS === "android" ? 96 : 86,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className={
            isLarge ? "flex-row gap-8 w-full" : "flex-col gap-8 w-full"
          }
        >
          {/* Columna principal */}
          <View className="flex-1 flex-col gap-6">
            {/* Información General */}
            <NewBasicInfo
              groupName={groupName}
              groupType={groupType}
              description={description}
              location={location}
              deliveryTime={deliveryTime}
              onChangeName={setGroupName}
              onChangeType={setGroupType}
              onChangeDescription={setDescription}
              onLocationPress={() => setShowLocationModal(true)}
              onTimePress={() => {}}
            />
            {/* Participantes */}
            <NewParticipants
              participants={participants}
              newName={newParticipantName}
              newInsta={newParticipantInstagram}
              onChangeName={setNewParticipantName}
              onChangeInsta={setNewParticipantInstagram}
              onAdd={() => {
                addParticipant({
                  id: Date.now().toString(),
                  name: newParticipantName || "",
                  instagramUsername: newParticipantInstagram || undefined,
                });
                setNewParticipantName("");
                setNewParticipantInstagram("");
              }}
              onRemove={removeParticipant}
            />
            {/* Productos Iniciales */}
            <NewProducts
              products={products}
              onAdd={() =>
                addProduct({ id: Date.now().toString(), name: "", price: 0 })
              }
              onUpdate={updateProduct}
              onRemove={removeProduct}
            />
          </View>
          {/* Columna lateral */}
          <View
            className={
              isLarge ? "w-[400px] self-start" : "w-full self-stretch mt-8"
            }
          >
            <NewSummary
              total={totals.total}
              perPerson={totals.perPerson}
              participantsCount={participants.length + 1}
              splitType={splitType}
              onCreate={handleCreate}
              loading={isLoading}
            />
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
          setLocation(`${coords.latitude},${coords.longitude}`);
          setShowLocationModal(false);
        }}
        onClose={() => setShowLocationModal(false)}
      />
    </View>
  );
};

export default CreateGroupScreen;
