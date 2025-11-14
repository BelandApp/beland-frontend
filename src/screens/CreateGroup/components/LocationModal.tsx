import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { MapSelector } from "./MapSelector";
import { modalStyles } from "../styles";

interface LocationModalProps {
  visible: boolean;
  currentLocation: any;
  isLoadingLocation: boolean;
  onLocationSelect: (location: string) => void;
  onGetCurrentLocation: () => void;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  currentLocation,
  isLoadingLocation,
  onLocationSelect,
  onGetCurrentLocation,
  onClose,
}) => {
  const [showMapSelector, setShowMapSelector] = useState(false);

  const openMapSelector = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMapSelector(true);
  };

  const handleMapLocationSelect = (
    location: string,
    coordinates?: { lat: number; lng: number }
  ) => {
    console.log("Ubicación seleccionada del mapa:", location, coordinates);
    onLocationSelect(location);
    setShowMapSelector(false);
    onClose();
  };

  const handleLocationSelect = (location: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLocationSelect(location);
    onClose();
  };

  const handleCurrentLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // Intentar obtener la ubicación
      await onGetCurrentLocation();
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      // El error ya será manejado por el hook useLocationModal
    }
  };

  const openLocationSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  const predefinedLocations = [
    "Palermo, CABA",
    "Villa Crespo, CABA",
    "Belgrano, CABA",
    "Caballito, CABA",
    "San Telmo, CABA",
    "Puerto Madero, CABA",
    "Recoleta, CABA",
    "Barracas, CABA",
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>
              📍 Selecciona tu ubicación
            </Text>
            <TouchableOpacity
              style={modalStyles.modalCloseButton}
              onPress={onClose}
            >
              <Text style={modalStyles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.locationList}>
            {/* Mensaje informativo */}
            <View style={modalStyles.infoContainer}>
              <Text style={modalStyles.infoText}>
                🎯 Para crear un grupo exitoso, necesitamos saber tu ubicación
                para coordinar la entrega de productos.
              </Text>
            </View>

            {/* Mensaje de ayuda si hay error */}
            {currentLocation?.error && (
              <View style={modalStyles.errorContainer}>
                <Text style={modalStyles.errorText}>
                  ⚠️ {currentLocation.error}
                </Text>
                <Text style={modalStyles.helpText}>
                  💡 Consejos: Asegúrate de tener activado el GPS en tu
                  dispositivo y permite el acceso a la ubicación cuando te lo
                  solicite.
                </Text>
                <TouchableOpacity
                  style={modalStyles.settingsButton}
                  onPress={openLocationSettings}
                  activeOpacity={0.8}
                >
                  <Text style={modalStyles.settingsButtonText}>
                    ⚙️ Abrir configuración de ubicación
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Botón de ubicación actual con iconos mejorados */}
            <TouchableOpacity
              style={[
                modalStyles.mapButton,
                modalStyles.primaryLocationButton,
                currentLocation &&
                  !currentLocation.error &&
                  modalStyles.mapButtonSelected,
              ]}
              onPress={handleCurrentLocation}
              activeOpacity={0.8}
              disabled={isLoadingLocation}
            >
              <View style={modalStyles.locationIconContainer}>
                <Text style={modalStyles.mapButtonIcon}>
                  {isLoadingLocation
                    ? "🔄"
                    : currentLocation && !currentLocation.error
                    ? "✅"
                    : "🛰️"}
                </Text>
              </View>
              <View style={modalStyles.mapButtonContent}>
                <Text style={modalStyles.mapButtonText}>
                  {isLoadingLocation
                    ? "Detectando tu ubicación..."
                    : currentLocation && !currentLocation.error
                    ? "Ubicación detectada "
                    : "Usar mi ubicación actual"}
                </Text>
                <Text style={modalStyles.mapButtonSubtext}>
                  {currentLocation && !currentLocation.error
                    ? currentLocation.address
                    : "Activar GPS para detección automática"}
                </Text>
              </View>
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="#667eea" />
              ) : (
                <View style={modalStyles.arrowContainer}>
                  <Text style={modalStyles.mapButtonArrow}>
                    {currentLocation && !currentLocation.error ? "📍" : "→"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Botón del Selector de Mapa con iconos mejorados */}
            <TouchableOpacity
              style={[modalStyles.mapButton, modalStyles.mapSelectorButton]}
              onPress={openMapSelector}
              activeOpacity={0.8}
            >
              <View style={modalStyles.locationIconContainer}>
                <Text style={modalStyles.mapButtonIcon}>🗺️</Text>
              </View>
              <View style={modalStyles.mapButtonContent}>
                <Text style={modalStyles.mapButtonText}>
                  Seleccionar en el mapa
                </Text>
                <Text style={modalStyles.mapButtonSubtext}>
                  Navega y elige tu ubicación exacta
                </Text>
              </View>
              <View style={modalStyles.arrowContainer}>
                <Text style={modalStyles.mapButtonArrow}>→</Text>
              </View>
            </TouchableOpacity>

            <View style={modalStyles.locationDivider}>
              <Text style={modalStyles.locationDividerText}>
                Ubicaciones sugeridas
              </Text>
            </View>

            {predefinedLocations.map((loc, index) => (
              <TouchableOpacity
                key={index}
                style={modalStyles.locationOption}
                onPress={() => handleLocationSelect(loc)}
                activeOpacity={0.8}
              >
                <View style={modalStyles.predefinedIconContainer}>
                  <Text style={modalStyles.locationOptionIcon}>📍</Text>
                </View>
                <Text style={modalStyles.locationOptionText}>{loc}</Text>
                <Text style={modalStyles.locationOptionArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Selector de Mapa Integrado */}
      {Platform.OS === "web" ? (
        (() => {
          const MapSelectorWeb = require("./MapSelectorWeb").MapSelectorWeb;
          return (
            <MapSelectorWeb
              visible={showMapSelector}
              onLocationSelect={handleMapLocationSelect}
              onClose={() => setShowMapSelector(false)}
            />
          );
        })()
      ) : (
        <MapSelector
          visible={showMapSelector}
          onLocationSelect={handleMapLocationSelect}
          onClose={() => setShowMapSelector(false)}
        />
      )}
    </Modal>
  );
};
