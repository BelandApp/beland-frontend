import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import mapboxService, { MapboxSuggestion } from "src/services/mapboxService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "src/styles";
import SearchBarInput from "./Search.input";
type SearchMapInputProps = {
  onChangeText: (name: string, value: string) => void;
  handleMapPicker: ({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) => void;
  setMapPickerVisible: (visible: boolean) => void;
};
const SearchMapInput: React.FC<SearchMapInputProps> = ({
  onChangeText,
  handleMapPicker,
  setMapPickerVisible,
}) => {
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
            limit: 6,
            country: "EC",
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
    <View>
      <View style={styles.searchContainer}>
        <View
          style={styles.searchBarContainer}
          onBlur={() => setSuggestions([])}
        >
          <SearchBarInput
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
            placeholder="Buscar dirección..."
          />
          {suggestions.length > 0 && (
            <ScrollView style={styles.suggestionsContainer}>
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
            </ScrollView>
          )}
        </View>
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
    </View>
  );
};

export default SearchMapInput;

const styles = StyleSheet.create({
  searchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  searchBarContainer: {
    flex: 1,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
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
    paddingHorizontal: 15,
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#FFF3ED",
    borderRadius: 8,
    marginBottom: 16,
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
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
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
