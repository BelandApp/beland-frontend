import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  TextInput,
} from "react-native";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../styles/colors";

interface AddressMapPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (coords: { latitude: number; longitude: number }) => void;
  initial?: { latitude: number; longitude: number } | null;
}

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
  const [suggestions, setSuggestions] = useState<
    Array<{ description: string; place_id: string }>
  >([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const geocoding = require("../../../services/geocodingService").default;

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

  // Minimal Leaflet HTML that allows clicking to place a marker and posts coords
  const mapHTML = `
  <!doctype html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html,body,#map{height:100%;margin:0;padding:0}
      .marker{width:26px;height:26px;border-radius:13px;background:#FF6B35;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.25)}
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function(){
        var map = L.map('map').setView([${initial?.latitude ?? 0}, ${
    initial?.longitude ?? 0
  }], ${initial ? 15 : 2});
        // expose helpers to be callable from parent
        window.map = map;
        window.selMarker = null;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:''}).addTo(map);
        var selMarker = null;
        function sendSelected(lat,lng){
          if(window.ReactNativeWebView){
            // React Native WebView
            window.ReactNativeWebView.postMessage(JSON.stringify({type:'selected',lat:lat,lng:lng}));
          } else if (window.parent) {
            // iframe/web: post to parent window
            try {
              window.parent.postMessage(JSON.stringify({type:'selected',lat:lat,lng:lng}), '*');
            } catch (e) {
              // ignore
            }
          }
        }
        map.on('click', function(e){
          var lat = e.latlng.lat; var lng = e.latlng.lng;
          if(selMarker) map.removeLayer(selMarker);
          selMarker = L.marker([lat,lng],{icon:L.divIcon({className:'',html:'<div class="marker"></div>',iconSize:[26,26],iconAnchor:[13,13]})}).addTo(map);
          sendSelected(lat,lng);
        });
        // If there's an initial marker, show it
        ${
          initial
            ? `selMarker = L.marker([${initial.latitude}, ${initial.longitude}],{icon:L.divIcon({className:'',html:'<div class="marker"></div>',iconSize:[26,26],iconAnchor:[13,13]})}).addTo(map);`
            : ""
        }
        // Listen for parent messages to center the map or set marker
        window.addEventListener('message', function(e){
          try {
            var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
            if(!data) return;
            if(data.type === 'center' && data.lat && data.lng){
              map.setView([data.lat, data.lng], 15);
              if(window.selMarker) map.removeLayer(window.selMarker);
              window.selMarker = L.marker([data.lat,data.lng],{icon:L.divIcon({className:'',html:'<div class="marker"></div>',iconSize:[26,26],iconAnchor:[13,13]})}).addTo(map);
            }
          }catch(err){/*ignore*/}
        });
        // Also expose a simple callback name for RN injectJavaScript
        window.__externalCenter = function(lat, lng){
          map.setView([lat, lng], 15);
          if(window.selMarker) map.removeLayer(window.selMarker);
          window.selMarker = L.marker([lat,lng],{icon:L.divIcon({className:'',html:'<div class="marker"></div>',iconSize:[26,26],iconAnchor:[13,13]})}).addTo(map);
          // also post message back to parent/native to keep selection in sync
          try{
            if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'selected',lat:lat,lng:lng}));
            else if(window.parent) window.parent.postMessage(JSON.stringify({type:'selected',lat:lat,lng:lng}),'*');
          }catch(e){}
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
        const items = await geocoding.autocomplete(query);
        setSuggestions(items || []);
      } catch (e) {
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
                    key={s.place_id}
                    onPress={async () => {
                      try {
                        const details = await geocoding.getPlaceDetails(
                          s.place_id
                        );
                        if (details && details.lat && details.lng) {
                          centerMap(details.lat, details.lng);
                          setSelected({
                            latitude: details.lat,
                            longitude: details.lng,
                          });
                        }
                      } catch (e) {
                        // ignore
                      } finally {
                        setSuggestions([]);
                        setQuery("");
                      }
                    }}
                    style={styles.suggestionItem}
                  >
                    <Text>{s.description}</Text>
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
                    key={s.place_id}
                    onPress={async () => {
                      try {
                        const details = await geocoding.getPlaceDetails(
                          s.place_id
                        );
                        if (details && details.lat && details.lng) {
                          centerMap(details.lat, details.lng);
                          setSelected({
                            latitude: details.lat,
                            longitude: details.lng,
                          });
                        }
                      } catch (e) {
                        // ignore
                      } finally {
                        setSuggestions([]);
                        setQuery("");
                      }
                    }}
                    style={styles.suggestionItem}
                  >
                    <Text>{s.description}</Text>
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
});
