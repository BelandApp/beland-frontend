import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { DeliveryAddress } from "src/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "src/styles";
import { Button, CustomInput, PhoneInput } from "src/components";
import { useNewAddress } from "../../hooks/useNewAddress";
import { AddressMapPicker } from "../AddressMapPicker";
import { useState, useEffect, useRef } from "react";
import * as mapboxService from "src/services/mapboxService";
import type { MapboxSuggestion } from "src/services/mapboxService";
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

  // Mapbox autocomplete
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // Autocomplete search with Mapbox
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const results = await mapboxService.searchAddressSuggestions(
          searchQuery,
          {
            language: "es",
            limit: 5,
          }
        );
        setSuggestions(results || []);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300) as unknown as number;

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectSuggestion = (suggestion: MapboxSuggestion) => {
    // Auto-fill form with selected address
    const streetAddress = suggestion.name || suggestion.full_address;
    const city =
      suggestion.context?.place?.name ||
      suggestion.context?.locality?.name ||
      "";
    const state = suggestion.context?.region?.name || "";
    const country = suggestion.context?.country?.name || "Ecuador";

    // Update all fields
    onChangeText("street", streetAddress);
    onChangeText("city", city);
    onChangeText("state", state);
    onChangeText("country", country);

    // Call handleMapPicker to store coordinates (it will do reverse geocoding)
    // This ensures coordinates are properly saved
    handleMapPicker({
      latitude: suggestion.coordinates.latitude,
      longitude: suggestion.coordinates.longitude,
    });

    setSearchQuery("");
    setSuggestions([]);
  };
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 8 }}
      >
        {/* Address Search with Mapbox */}
        <View style={styles.searchGroup}>
          <Text style={styles.searchLabel}>Buscar dirección</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Busca tu dirección..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.mapIconButton}
              onPress={() => setMapPickerVisible(true)}
            >
              <MaterialCommunityIcons
                name="map"
                size={20}
                color={colors.belandOrange}
              />
            </TouchableOpacity>
            {loadingSuggestions && (
              <ActivityIndicator
                size="small"
                color={colors.belandOrange}
                style={styles.searchLoader}
              />
            )}
          </View>
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(suggestion)}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={18}
                    color={colors.belandOrange}
                  />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionName}>{suggestion.name}</Text>
                    <Text style={styles.suggestionAddress}>
                      {suggestion.full_address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <CustomInput
          variant="filled"
          label="Dirección completa"
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
        </View>
        <PhoneInput
          value={FormData.phone || ""}
          onChange={(phone) => onChangeText("phone", phone)}
          error={errors.phone}
          variant="filled"
          icon
        />

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
      </ScrollView>
      <View style={styles.rowActions}>
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
    height: Dimensions.get("window").height * 0.8,
    justifyContent: "space-between",
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
  rowActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
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
  searchGroup: {
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  searchContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    paddingRight: 50,
    fontSize: 15,
    backgroundColor: "#F9F9F9",
    color: "#333",
  },
  mapIconButton: {
    position: "absolute",
    right: 4,
    padding: 10,
    backgroundColor: "#FFF3ED",
    borderRadius: 8,
  },
  searchLoader: {
    position: "absolute",
    right: 55,
    top: 12,
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 10,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 12,
    color: "#666",
  },
});
