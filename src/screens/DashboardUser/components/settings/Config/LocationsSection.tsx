import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useConfig } from "src/screens/DashboardUser/hooks/useConfig";
import {
  Button,
  CustomInput,
  CustomLoader,
  WrapperModal,
} from "src/components";
import { Delete, Edit, MapPin, X } from "lucide-react-native";

const LocationsSection = () => {
  const {
    locations,
    loading,
    refreshLocations,
    openCreateModal,
    openEditModal,
    closeModal,
    modalLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    setField,
    temporalLocation,
  } = useConfig();
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.title}>Ubicaciones existentes</Text>
        <View style={styles.row}>
          <Button
            title="Recargar"
            variant="secondary"
            onPress={refreshLocations}
          />
          <Button title="Agregar nueva ubicación" onPress={openCreateModal} />
        </View>
      </View>
      {loading ? (
        <CustomLoader />
      ) : (
        <View>
          {locations.length > 0 ? (
            locations.map((location) => (
              <View key={location.id} style={styles.row}>
                <Text>{location.name}</Text>
                <Text>Lat: {location.latitude}</Text>
                <Text>Long: {location.longitude}</Text>
                <Edit onPress={() => openEditModal(location)} />
                <X onPress={() => deleteLocation(location.id)} />
              </View>
            ))
          ) : (
            <Text>Todavia no hay ubicaciones</Text>
          )}
        </View>
      )}
      <WrapperModal
        isOpen={modalLocation !== null}
        onClose={closeModal}
        header={
          <View style={styles.row}>
            <MapPin className="text-orange-500" />
            <Text style={styles.title}>
              {modalLocation?.id === "0" ? "Crear" : "Actualizar"} Ubicación
            </Text>
          </View>
        }
        content={
          <View>
            <CustomInput
              label="Name"
              value={temporalLocation?.name!}
              onChangeText={(text) => setField("name", text)}
            />
            <CustomInput
              label="Latitud"
              value={temporalLocation?.latitude!}
              onChangeText={(text) => setField("latitude", text)}
            />
            <CustomInput
              label="Longitud"
              value={temporalLocation?.longitude!}
              onChangeText={(text) => setField("longitude", text)}
            />
          </View>
        }
        actions={
          <View style={styles.row}>
            <Button title="Cerrar" variant="ghost" onPress={closeModal} />
            <Button
              title={modalLocation?.id === "0" ? "Crear" : "Actualizar"}
              onPress={() => {
                modalLocation?.id === "0" ? createLocation() : updateLocation();
              }}
            />
          </View>
        }
      />
    </View>
  );
};

export default LocationsSection;

const styles = StyleSheet.create({
  title: { fontSize: 25, fontWeight: "semibold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
});
