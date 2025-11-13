import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ResourceService } from "@services/core";
import UserResourceCard from "./components/UserResourceCard";
import { useCustomAlert } from "src/hooks/useCustomAlert";
import { Gift, Filter } from "lucide-react-native";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { CustomLoader, useThemedTabs } from "src/components";
import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";

const UserResourcesScreen: React.FC = () => {
  const { tabs, onTabChange, filterWithTab, getFilteredByActiveTab } =
    useThemedTabs(["Todos", "Activos", "Expirados"]);
  // TODO MOVER A UN HOOK
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const resp = await ResourceService.getUserResources({
        limit: 50,
        page: 1,
      });

      console.log("UserResourcesScreen response:", resp);

      // Handle response structure [items[], count] or direct items
      let resourceData: any[] = [];
      if (Array.isArray(resp)) {
        if (resp.length === 2 && Array.isArray(resp[0])) {
          // Paginated response: [items[], total]
          resourceData = resp[0];
        } else {
          // Direct array
          resourceData = resp;
        }
      } else if (resp && resp.data) {
        // Standard paginated response with data property
        resourceData = resp.data;
      }

      setItems(resourceData || []);
    } catch (err) {
      console.error("Error cargando beneficios del usuario:", err);
      showCustomAlert("Error", "No se pudieron cargar tus beneficios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filters = {
    Activos: (item: any) => {
      return item.expires_at > Date.now();
    },
    Expirados: (item: any) => item.expires_at < Date.now(),
  };
  // TODO FIN 
  
  const filtered = getFilteredByActiveTab(items, filters);

  const { showCustomAlert } = useCustomAlert();
  const { navigate } = useCustomNavigation();

  if (loading) {
    return (
      <CustomLoader/>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedHeader title="Mis Beneficios" canGoBack />
      <ThemedTabs tabs={tabs} onTabChange={onTabChange} />
      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <UserResourceCard
            item={item}
            onUse={(it) => {
              // Redirigir al scanner QR pasando el recurso seleccionado
              navigate("QR", { pendingRedemption: it });
            }}
            onDetails={(it) => {
              showCustomAlert("Detalle", JSON.stringify(it), "info");
            }}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <View style={{ padding: 16 }}>
            <Text>No tienes beneficios activos.</Text>
          </View>
        )}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F8" },
  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  header: { fontSize: 20, fontWeight: "700", marginLeft: 8 },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingTop: 16,
  },
  filterOptions: { flexDirection: "row", marginLeft: 8 },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "transparent",
    marginLeft: 6,
  },
  filterBtnActive: { backgroundColor: "#FFEDD8" },
  filterText: { color: "#6B7280", fontSize: 13 },
  filterTextActive: { color: "#FF6B35", fontWeight: "700" },
});

export default UserResourcesScreen;
