import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../styles/colors";
import * as mapboxService from "../../../services/mapboxService";
import type { MapboxSuggestion } from "../../../services/mapboxService";

interface AddressMapPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (coords: { latitude: number; longitude: number }) => void;
  initial?: { latitude: number; longitude: number } | null;
}

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export const AddressMapPicker: React.FC<AddressMapPickerProps> = ({
  visible,
  onClose,
  onSelect,
  initial = null,
}) => {
  const webRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);
  const [selected, setSelected] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initial);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "selected") {
        const { lat, lng } = data;
        setSelected({ latitude: lat, longitude: lng });
      }
    } catch (e) {
      // ignore
    }
  };

  const centerMap = (lat: number, lng: number) => {
    if (Platform.OS === "web") {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ type: "center", lat, lng }),
            "*"
          );
        }
      } catch (e) {
        // ignore
      }
      return;
    }

    // Native WebView: inject JS to call exposed window.centerFromRN
    try {
      if (webRef.current && webRef.current.injectJavaScript) {
        const js = `window.__externalCenter && window.__externalCenter(${lat}, ${lng});true;`;
        webRef.current.injectJavaScript(js);
      }
    } catch (e) {
      // ignore
    }
  };

  const confirm = () => {
    if (selected) {
      onSelect(selected);
    }
    onClose();
  };

  // Minimal Mapbox GL JS HTML that allows clicking to place a marker
  const mapHTML = `
  <!doctype html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css' rel='stylesheet' />
    <style>
      html,body,#map{height:100%;margin:0;padding:0}
      .mapboxgl-ctrl-logo,.mapboxgl-ctrl-attrib{display:none!important}
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js'></script>
    <script>
      (function(){
        mapboxgl.accessToken = '${MAPBOX_ACCESS_TOKEN}';
        
        const initialCenter = [${initial?.longitude ?? -57.5759}, ${
    initial?.latitude ?? -25.2637
  }];
        const initialZoom = ${initial ? 15 : 12};
        
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v12',
          center: initialCenter,
          zoom: initialZoom
        });
        
        window.map = map;
        let marker = null;
        
        function sendSelected(lat, lng) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({type:'selected', lat:lat, lng:lng}));
          } else if (window.parent) {
            try {
              window.parent.postMessage(JSON.stringify({type:'selected', lat:lat, lng:lng}), '*');
            } catch (e) {}
          }
        }
        
        map.on('click', function(e) {
          const lat = e.lngLat.lat;
          const lng = e.lngLat.lng;
          
          if (marker) {
            marker.remove();
          }
          
          marker = new mapboxgl.Marker({color: '#FF6B35'})
            .setLngLat([lng, lat])
            .addTo(map);
          
          sendSelected(lat, lng);
        });
        
        // Add initial marker if provided
        ${
          initial
            ? `marker = new mapboxgl.Marker({color: '#FF6B35'})
            .setLngLat([${initial.longitude}, ${initial.latitude}])
            .addTo(map);`
            : ""
        }
        
        // Listen for parent messages to center the map
        window.addEventListener('message', function(e) {
          try {
            const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
            if (!data) return;
            if (data.type === 'center' && data.lat && data.lng) {
              map.flyTo({center: [data.lng, data.lat], zoom: 15});
              if (marker) marker.remove();
              marker = new mapboxgl.Marker({color: '#FF6B35'})
                .setLngLat([data.lng, data.lat])
                .addTo(map);
            }
          } catch(err) {}
        });
        
        // Expose a callback for RN injectJavaScript
        window.__externalCenter = function(lat, lng) {
          map.flyTo({center: [lng, lat], zoom: 15});
          if (marker) marker.remove();
          marker = new mapboxgl.Marker({color: '#FF6B35'})
            .setLngLat([lng, lat])
            .addTo(map);
          try {
            if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'selected', lat:lat, lng:lng}));
            else if (window.parent) window.parent.postMessage(JSON.stringify({type:'selected', lat:lat, lng:lng}),'*');
          } catch(e) {}
        };
      })();
    </script>
  </body>
  </html>
  `;

  // Web: render inside an iframe and listen for postMessage
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data && data.type === "selected") {
          setSelected({ latitude: data.lat, longitude: data.lng });
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Autocomplete for the search input (debounced)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const items = await mapboxService.searchAddressSuggestions(query, {
          language: "es",
          limit: 5,
        });
        setSuggestions(items || []);
      } catch (e) {
        console.error("Error fetching suggestions:", e);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (Platform.OS === "web") {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.webOverlay}>
          <View style={styles.webContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Seleccionar ubicación</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {/* Search bar */}
            <View style={styles.searchRow}>
              <TextInput
                value={query}
                onChangeText={(t) => setQuery(t)}
                placeholder="Buscar dirección o punto"
                style={styles.searchInput}
              />
            </View>
            {suggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                {suggestions.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => {
                      const lat = s.coordinates.latitude;
                      const lng = s.coordinates.longitude;
                      centerMap(lat, lng);
                      setSelected({ latitude: lat, longitude: lng });
                      setSuggestions([]);
                      setQuery("");
                    }}
                    style={styles.suggestionItem}
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={18}
                      color={colors.belandOrange}
                      style={{ marginRight: 8 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionName}>{s.name}</Text>
                      <Text style={styles.suggestionAddress}>
                        {s.full_address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <iframe
              ref={iframeRef}
              title="map-picker"
              srcDoc={mapHTML}
              style={{ flex: 1, width: "100%", height: "100%", border: 0 }}
            />
            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} style={styles.cancel}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirm} style={styles.confirm}>
                <Text style={{ color: "white" }}>Confirmar ubicación</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar ubicación</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, borderRadius: 12, overflow: "hidden" }}>
            {/* Search bar for native */}
            <View style={styles.nativeSearchRow}>
              <TextInput
                value={query}
                onChangeText={(t) => setQuery(t)}
                placeholder="Buscar dirección o punto"
                style={styles.searchInput}
              />
            </View>
            {suggestions.length > 0 && (
              <View style={styles.suggestionsBoxNative}>
                {suggestions.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => {
                      const lat = s.coordinates.latitude;
                      const lng = s.coordinates.longitude;
                      centerMap(lat, lng);
                      setSelected({ latitude: lat, longitude: lng });
                      setSuggestions([]);
                      setQuery("");
                    }}
                    style={styles.suggestionItem}
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={18}
                      color={colors.belandOrange}
                      style={{ marginRight: 8 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionName}>{s.name}</Text>
                      <Text style={styles.suggestionAddress}>
                        {s.full_address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <WebView
              ref={webRef}
              originWhitelist={["*"]}
              source={{ html: mapHTML }}
              onMessage={handleMessage}
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirm} style={styles.confirm}>
              <Text style={{ color: "white" }}>Confirmar ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: "90%",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  closeBtn: { position: "absolute", right: 12, top: 10 },
  actions: {
    flexDirection: "row",
    padding: 12,
    justifyContent: "flex-end",
    gap: 12,
  },
  cancel: { padding: 12, borderRadius: 8, backgroundColor: "#F0F0F0" },
  confirm: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.belandOrange,
  },
  webOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  webContainer: {
    width: "100%",
    maxWidth: 900,
    height: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  searchRow: {
    padding: 10,
    backgroundColor: "white",
  },
  nativeSearchRow: {
    padding: 8,
    backgroundColor: "white",
  },
  searchInput: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
  },
  suggestionsBox: {
    maxHeight: 200,
    overflow: "hidden",
    backgroundColor: "white",
  },
  suggestionsBoxNative: {
    maxHeight: 160,
    backgroundColor: "white",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
