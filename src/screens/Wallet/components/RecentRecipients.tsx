import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RecentRecipient } from "@services/core";

interface RecentRecipientsProps {
  recipients?: RecentRecipient[] | null;
  onSelectRecipient: (recipient: RecentRecipient) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

const RecentRecipients: React.FC<RecentRecipientsProps> = ({
  recipients,
  onSelectRecipient,
  loading = false,
  onRefresh,
}) => {
  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderRecipient = ({ item }: { item: RecentRecipient }) => (
    <TouchableOpacity
      style={styles.recipientCard}
      onPress={() => onSelectRecipient(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.picture ? (
          <Image source={{ uri: item.picture }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{getInitials(item.full_name)}</Text>
          </View>
        )}
      </View>
      <View style={styles.recipientInfo}>
        <Text style={styles.recipientName} numberOfLines={1}>
          {item.full_name || "Usuario"}
        </Text>
        <Text style={styles.recipientEmail} numberOfLines={1}>
          {item.email || "Sin email"}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

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
        <Text style={styles.emptyNote}>
          Nota: Puede tomar unos momentos en actualizarse después de una
          transferencia.
        </Text>
        {onRefresh && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefresh}
            disabled={loading}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Actualizar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="history" size={20} color="#7DA244" />
          <Text style={styles.title}>Contactos Recientes</Text>
        </View>
        {onRefresh && (
          <TouchableOpacity
            onPress={onRefresh}
            style={styles.refreshButton}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={loading ? "#d1d5db" : "#7DA244"}
            />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={recipients}
        renderItem={renderRecipient}
        keyExtractor={(item) => item.wallet_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0fdf4",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  recipientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  avatarContainer: {
    marginRight: 12,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  recipientInfo: {
    flex: 1,
    marginRight: 8,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  recipientEmail: {
    fontSize: 14,
    color: "#6b7280",
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
