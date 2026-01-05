import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RecentRecipient } from "@services/core";

interface RecentRecipientsProps {
  recipients?: RecentRecipient[] | null;
  onSelectRecipient: (recipient: RecentRecipient) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

const NUM_COLUMNS = 2;
const { width } = Dimensions.get("window");
const isNarrow = width <= 480;

const RecentRecipients: React.FC<RecentRecipientsProps> = ({
  recipients,
  onSelectRecipient,
  loading = false,
  onRefresh,
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!recipients) return [];
    const q = (query || "").trim().toLowerCase();
    if (!q) return recipients;
    return recipients.filter((r) => {
      const name = (r.full_name || "").toLowerCase();
      const email = (r.email || "").toLowerCase();
      const username = (r.username || "").toLowerCase();
      return name.includes(q) || email.includes(q) || username.includes(q);
    });
  }, [recipients, query]);

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderRecipient = ({ item }: { item: RecentRecipient }) => {
    const avatarSize = isNarrow ? 40 : 48;
    const nameSize = isNarrow ? 14 : 15;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onSelectRecipient(item)}
        style={[
          styles.recipientCard,
          {
            flexBasis: isNarrow ? "100%" : "48%",
            paddingHorizontal: isNarrow ? 10 : 12,
            paddingVertical: isNarrow ? 10 : 14,
          },
        ]}
      >
        <View style={styles.cardInner}>
          <View
            style={[
              styles.avatarContainer,
              { marginRight: isNarrow ? 10 : 14 },
            ]}
          >
            {item.picture ? (
              <Image
                source={{ uri: item.picture }}
                style={[
                  styles.avatar,
                  {
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                  },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarPlaceholder,
                  {
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                  },
                ]}
              >
                <Text style={styles.avatarText}>
                  {getInitials(item.full_name)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.recipientInfo}>
            <Text
              style={[styles.recipientName, { fontSize: nameSize }]}
              numberOfLines={1}
            >
              {item.full_name || "Usuario"}
            </Text>
            <Text
              style={[styles.recipientEmail, { fontSize: isNarrow ? 12 : 13 }]}
              numberOfLines={1}
            >
              {item.email || "Sin email"}
            </Text>
          </View>
          <View style={styles.chevronWrap}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={isNarrow ? 18 : 20}
              color="#c7cbd1"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="loading" size={24} color="#7DA244" />
        <Text style={styles.loadingText}>Cargando contactos...</Text>
      </View>
    );
  }

  if (!recipients || recipients.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="account-group-outline"
          size={48}
          color="#d1d5db"
        />
        <Text style={styles.emptyText}>
          Aún no hay contactos recientes disponibles
        </Text>
        <Text style={styles.emptySubtext}>
          Las transferencias recientes aparecerán aquí.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.searchRow, { marginTop: isNarrow ? 12 : 20 }]}>
        <MaterialCommunityIcons name="magnify" size={18} color="#9ca3af" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar contactos"
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.searchEmptyContainer}>
          <MaterialCommunityIcons
            name="magnify-close"
            size={36}
            color="#9ca3af"
          />
          <Text style={styles.searchEmptyText}>Contacto no encontrado</Text>
          <Text style={styles.searchEmptySubtext}>
            Intenta otro nombre o alias
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderRecipient}
          keyExtractor={(item) => item.wallet_id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          numColumns={isNarrow ? 1 : NUM_COLUMNS}
          columnWrapperStyle={isNarrow ? undefined : styles.columnWrapper}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonDisabled: {
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 10,
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eef2ff",
    marginBottom: 8,
    marginTop: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    height: 36,
    color: "#0f172a",
    fontSize: 14,
  },
  recipientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 6,
    marginHorizontal: 4,
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: "#7DA244",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  recipientInfo: {
    flex: 1,
    marginRight: 8,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  recipientEmail: {
    fontSize: 13,
    color: "#6b7280",
  },
  chevronWrap: {
    paddingLeft: 8,
    paddingRight: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  searchEmptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  searchEmptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  searchEmptySubtext: {
    marginTop: 6,
    fontSize: 13,
    color: "#9ca3af",
  },
  emptyNote: {
    marginTop: 12,
    fontSize: 12,
    color: "#f59e0b",
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7DA244",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RecentRecipients;
