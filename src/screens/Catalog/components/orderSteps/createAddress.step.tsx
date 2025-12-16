import { ScrollView, View, Text, StyleSheet, Dimensions } from "react-native";
import { DeliveryAddress } from "src/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "src/styles";
import { Button, CustomInput, PhoneInput } from "src/components";
import { useNewAddress } from "../../hooks/useNewAddress";
import { AddressMapPicker } from "../AddressMapPicker";
import SearchMapInput from "src/components/shared/input/SearchMap.input";
interface AddressFormProps {
  initialAddress?: DeliveryAddress;
  onCreateAddress: (address: DeliveryAddress) => void;
  onCreateAndSubmit: (address: DeliveryAddress) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
export const CreateAddress: React.FC<AddressFormProps> = ({
  initialAddress,
  onCreateAddress,
  onCreateAndSubmit,
  onCancel,
}) => {
  const {
    FormData,
    errors,
    onChangeText,
    handleCreateAddress,
    handleCreateAndSubmit,
    mapPickerVisible,
    setMapPickerVisible,
    handleMapPicker,
  } = useNewAddress({
    initialAddress,
    onCreateAddress,
    onCreateAndSubmit,
  });

  return (
    <View style={styles.container}>
      <ScrollView
        // showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        <View style={styles.searchWrapper}>
          <SearchMapInput
            handleMapPicker={handleMapPicker}
            onChangeText={onChangeText}
            setMapPickerVisible={setMapPickerVisible}
          />
        </View>
        <View style={styles.row}>
          <CustomInput
            variant="filled"
            label="Calle y Numeración"
            onChangeText={(street) => onChangeText("street", street)}
            value={FormData.street || ""}
            error={errors.street}
            placeholder=""
            icon={
              <MaterialCommunityIcons
                name="home-outline"
                size={20}
                color="#666"
                style={styles.icon}
              />
            }
          />
          <CustomInput
            variant="filled"
            label="Código Postal"
            onChangeText={(CP) => onChangeText("zipCode", CP)}
            value={FormData.zipCode || ""}
            error={errors.zipCode}
            placeholder=""
            icon={
              <MaterialCommunityIcons
                name="email-variant"
                size={20}
                color="#666"
                style={styles.icon}
              />
            }
          />
        </View>
        <View style={styles.row}>
          <CustomInput
            variant="filled"
            label="Ciudad"
            onChangeText={(city) => onChangeText("city", city)}
            value={FormData.city || ""}
            error={errors.city}
            icon={
              <MaterialCommunityIcons
                name="city"
                size={20}
                color="#666"
                style={styles.icon}
              />
            }
          />
          <CustomInput
            variant="filled"
            label="Provincia/Estado"
            onChangeText={(state) => onChangeText("state", state)}
            value={FormData.state || ""}
            error={errors.state}
            icon={
              <MaterialCommunityIcons
                name="map-outline"
                size={20}
                color="#666"
                style={styles.icon}
              />
            }
          />
        </View>
        <View style={styles.row}>
          <CustomInput
            variant="filled"
            label="País"
            onChangeText={(country) => onChangeText("country", country)}
            value={FormData.country || ""}
            error={errors.country}
            icon={
              <MaterialCommunityIcons
                name="flag-outline"
                size={20}
                color="#666"
                style={styles.icon}
              />
            }
          />

          <PhoneInput
            value={FormData.phone || ""}
            onChange={(phone) => onChangeText("phone", phone)}
            error={errors.phone}
            variant="filled"
            icon
          />
        </View>
        <CustomInput
          variant="filled"
          label="Información Adicional"
          onChangeText={(additionalInfo) =>
            onChangeText("additionalInfo", additionalInfo)
          }
          value={FormData.additionalInfo || ""}
          error={errors.additionalInfo}
          placeholder="Ej: Apartamento 3B, referencias, instrucciones especiales..."
          icon={
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
          }
        />
        {/* Delivery Info */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={colors.belandOrange}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Información de entrega</Text>
            <Text style={styles.infoText}>
              • Tiempo estimado: 2-3 días hábiles{"\n"}• Costo de envío: $2.50
            </Text>
          </View>
        </View>
        <View style={styles.actionsContainer}>
          {Dimensions.get("window").width > 600 && (
            <Button title="Cancelar" onPress={onCancel} variant="ghost" />
          )}
          <Button
            title="Guardar Dirección"
            onPress={handleCreateAddress}
            variant="secondary"
          />
          <Button title="Guardar y Continuar" onPress={handleCreateAndSubmit} />
        </View>
      </ScrollView>
      <AddressMapPicker
        visible={mapPickerVisible}
        onClose={() => setMapPickerVisible(false)}
        initial={
          FormData.latitude && FormData.longitude
            ? { latitude: FormData.latitude, longitude: FormData.longitude }
            : null
        }
        onSelect={(coords) => handleMapPicker(coords)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    flex: 1,
    overflow: "visible",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  rowPicker: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  mapPicker: {
    marginLeft: 8,
    padding: 10.5,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: Dimensions.get("window").width > 600 ? "row" : "column",
    gap: 12,
    alignItems: Dimensions.get("window").width > 600 ? "center" : "stretch",
    justifyContent: "space-between",
  },
  actionsContainer: {
    marginTop: 8,
    marginHorizontal: "auto",
    flexDirection: Dimensions.get("window").width > 600 ? "row" : "column",
    gap: 12,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#FFF3ED",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.belandOrange,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  icon: {
    paddingRight: 12,
  },
  searchWrapper: {
    position: "relative",
    zIndex: 9999,
    elevation: 20,
  },
});
