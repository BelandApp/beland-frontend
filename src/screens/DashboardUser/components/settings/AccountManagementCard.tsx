import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Edit3, MapPin, Lock, Bell, CreditCard } from "lucide-react-native";

interface AccountManagementCardProps {
  onPasswordChange?: () => void;
  onAddressManagement?: () => void;
}

export const AccountManagementCard: React.FC<AccountManagementCardProps> = ({
  onPasswordChange,
  onAddressManagement,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Cuenta</Text>
        <Text style={styles.subtitle}>
          Administra tu seguridad y preferencias
        </Text>
      </View>

      <View style={styles.actionsGrid}>
        {/* Cambiar Contraseña */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={onPasswordChange}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#FFE8E0" }]}>
            <Lock size={24} color="#FF6B35" />
          </View>
          <Text style={styles.actionTitle}>Cambiar Contraseña</Text>
          <Text style={styles.actionDescription}>
            Actualiza tu contraseña de acceso
          </Text>
        </TouchableOpacity>

        {/* Gestionar Direcciones */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={onAddressManagement}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#E8F5E9" }]}>
            <MapPin size={24} color="#4CAF50" />
          </View>
          <Text style={styles.actionTitle}>Gestionar Direcciones</Text>
          <Text style={styles.actionDescription}>
            Agrega o modifica tus direcciones de entrega
          </Text>
        </TouchableOpacity>

        {/* Notificaciones */}
        <TouchableOpacity
          style={[styles.actionCard, styles.disabledCard]}
          activeOpacity={0.5}
          disabled
        >
          <View style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}>
            <Bell size={24} color="#2196F3" />
          </View>
          <Text style={styles.actionTitle}>Notificaciones</Text>
          <Text style={styles.actionDescription}>
            Configura tus preferencias
          </Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Próximamente</Text>
          </View>
        </TouchableOpacity>

        {/* Métodos de Pago */}
        <TouchableOpacity
          style={[styles.actionCard, styles.disabledCard]}
          activeOpacity={0.5}
          disabled
        >
          <View style={[styles.iconContainer, { backgroundColor: "#F3E5F5" }]}>
            <CreditCard size={24} color="#9C27B0" />
          </View>
          <Text style={styles.actionTitle}>Métodos de Pago</Text>
          <Text style={styles.actionDescription}>
            Administra tus tarjetas y cuentas
          </Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Próximamente</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    alignItems: "flex-start",
    position: "relative",
  },
  disabledCard: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: "#999",
    lineHeight: 16,
  },
  comingSoonBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
});
