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
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { Gift, Filter } from "lucide-react-native";
import { ThemedHeader } from "src/components/shared/headers/Header";

const UserResourcesScreen: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const FILTERS = ["Todos", "Activos", "Expirados"];
  const { showCustomAlert } = useCustomAlert();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const load = async () => {
    setLoading(true);
    try {
      const resp = await ResourceService.getRecyclingTransactions({
        limit: 50,
        page: 1,
      });
      setItems(resp.data || []);
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

  const [filter, setFilter] = useState<string>(FILTERS[0]);
  const filtered = items.filter((it) => {
    if (filter === "Todos") return true;
    const expiresAt = it.expires_at ? new Date(it.expires_at) : null;
    const isExpired = expiresAt ? expiresAt.getTime() < Date.now() : false;
    if (filter === "Activos") return !isExpired;
    if (filter === "Expirados") return isExpired;
    return true;
  });
  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
        <ThemedHeader title="Mis Beneficios" canGoBack/>

        <View style={styles.filterRow}>
          <Filter size={18} color="#6B7280" />
          <View style={styles.filterOptions}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterBtn,
                  filter === f && styles.filterBtnActive,
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === f && styles.filterTextActive,
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <UserResourceCard
            item={item}
            onUse={(it) => {
              // Redirigir al scanner QR pasando el recurso seleccionado
              navigation.navigate(
                "QR" as any,
                { pendingRedemption: it } as any
              );
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
  filterRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", paddingTop: 16 },
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
