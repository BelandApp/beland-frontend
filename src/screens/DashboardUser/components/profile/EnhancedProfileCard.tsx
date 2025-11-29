import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Edit3,
  Camera,
  Check,
  X,
} from "lucide-react-native";
import { useAuth } from "src/context";
import { useUserProfileForm } from "src/hooks/user/useUserProfileForm";
import ProfileImagePicker from "../imagePicker/ProfileImagePicker";
import UserProfileFields from "../fields/UserProfileFields";

interface EnhancedProfileCardProps {}

export const EnhancedProfileCard: React.FC<EnhancedProfileCardProps> = () => {
  const { user, setUser } = useAuth();
  const form = useUserProfileForm(user, setUser);

  if (!user) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header con imagen de perfil */}
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <ProfileImagePicker
            localImage={form.localImage}
            userPicture={user.profile_picture_url}
            editing={form.editing}
            pickImage={form.pickImage}
          />
          {form.editing && (
            <View style={styles.editBadge}>
              <Camera size={16} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.userName}>
            {user.full_name || user.email.split("@")[0]}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.role_name && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user.role_name === "USER"
                  ? "Usuario"
                  : user.role_name === "COMMERCE"
                  ? "Comercio"
                  : user.role_name}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => form.setEditing((s) => !s)}
        >
          {form.editing ? (
            <X size={20} color="#666" />
          ) : (
            <Edit3 size={20} color="#FF6B35" />
          )}
        </TouchableOpacity>
      </View>

      {/* Información del perfil */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {form.editing ? (
          <View style={styles.editSection}>
            <View style={styles.editHeader}>
              <Text style={styles.sectionTitle}>Editar Información</Text>
              <Text style={styles.editSubtitle}>
                Actualiza tus datos personales
              </Text>
            </View>

            <View style={styles.editForm}>
              <UserProfileFields {...form} />
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={form.onCancel}
              >
                <X size={18} color="#666" />
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => form.onSave()}
                disabled={form.saving}
              >
                {form.saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Check size={18} color="#fff" />
                    <Text style={styles.saveText}>Guardar Cambios</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.infoSection}>
            {/* Información básica */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Información Personal</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <User size={18} color="#FF6B35" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nombre Completo</Text>
                  <Text style={styles.infoValue}>
                    {user.full_name || "No especificado"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Mail size={18} color="#2196F3" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Correo Electrónico</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Phone size={18} color="#4CAF50" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>
                    {(user as any).phone || "No especificado"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MapPin size={18} color="#9C27B0" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Dirección</Text>
                  <Text style={styles.infoValue}>
                    {(user as any).address || "No especificado"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Calendar size={18} color="#FF9800" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Miembro desde</Text>
                  <Text style={styles.infoValue}>
                    {formatDate((user as any).created_at)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9F9F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  avatarSection: {
    position: "relative",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6B35",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    maxHeight: 500,
  },
  editSection: {
    padding: 20,
  },
  editHeader: {
    marginBottom: 20,
  },
  editSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  editForm: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoSection: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F0F0F0",
    paddingVertical: 14,
    borderRadius: 12,
  },
  cancelText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF6B35",
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
