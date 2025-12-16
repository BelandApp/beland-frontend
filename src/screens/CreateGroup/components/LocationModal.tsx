import React, { useState } from "react";

// Este modal usa Mapbox GL JS para web y Mapbox SDK para React Native
// Debes tener tu token de Mapbox en una variable de entorno o constante
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || "";

interface LocationModalProps {
  visible: boolean;
  currentLocation: { lat: number; lng: number } | null;
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  currentLocation,
  onLocationSelect,
  onClose,
}) => {
  // Solo renderizar si visible
  if (!visible) return null;

  // Web: usar Mapbox GL JS
  // Native: usar Mapbox SDK (no implementado aquí, solo placeholder)
  // Aquí solo se muestra el contenedor, la integración real depende del entorno
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[500px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="font-bold text-lg">Selecciona la ubicación</span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 font-bold"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 relative">
          {/* Aquí va el mapa de Mapbox (web) */}
          <div id="mapbox-map" className="absolute inset-0 rounded-b-xl" />
        </div>
        <div className="p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
