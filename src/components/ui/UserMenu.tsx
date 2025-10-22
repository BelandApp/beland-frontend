import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "src/context";
import {
  LogOut,
  LayoutDashboard,
  Store,
  Gift,
  User,
  Settings,
  PackageIcon,
  GiftIcon,
  Percent,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { showSuccessAlert, showErrorAlert } from "../../utils/alertHelpers";
import { authService } from "../../services/auth/auth.service";

interface UserMenuProps {
  style?: any;
  variant?: "compact" | "full";
  iconColor?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  style,
  variant = "compact",
  iconColor = "#fff",
}) => {
  const navigation = useNavigation();
  const { user, isLoading, handleAuth0Login, logout } = useAuth();

  const [menuVisible, setMenuVisible] = useState(false);
  const [showCommerceAlert, setShowCommerceAlert] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleNavigateToDashboard = () => {
    setMenuVisible(false);
    (navigation as any).navigate("UserDashboardScreen");
  };
  const handleChangeRoleToCommerce = async () => {
    setIsChangingRole(true);
    try {
      const resp = await authService.changeRoleToCommerce();
      setShowCommerceAlert(false);
      showSuccessAlert(
        "¡Ya eres comerciante!",
        "Tu perfil ha sido actualizado y ahora puedes recibir pagos por QR.",
        "OK"
      );
      await authService.getCurrentUser(resp.token);
    } catch (err) {
      setShowCommerceAlert(false);
      showErrorAlert(
        "Error",
        String(err) || "No se pudo cambiar el rol. Intenta nuevamente.",
        "OK"
      );
    } finally {
      setIsChangingRole(false);
    }
  };
  if (isLoading) {
    return (
      <TouchableOpacity
        onPress={handleLogout}
        style={[styles.container, style]}
      >
        <ActivityIndicator size="small" color={iconColor} />
      </TouchableOpacity>
    );
  }

  if (!user) {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("Login" as never)}
        style={[styles.loginButton, style]}
      >
        <User size={20} color={iconColor} />
        {variant === "full" && (
          <Text style={[styles.loginText, { color: iconColor }]}>
            Iniciar sesión
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={toggleMenu} style={styles.avatarContainer}>
        <Image
          source={{
            uri:
              user.profile_picture_url ||
              "https://ui-avatars.com/api/?name=User",
          }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={toggleMenu}>
          <View style={styles.menuDropdown}>
            {/* Header del menú con info del usuario */}
            <View style={styles.menuHeader}>
              <Image
                source={{
                  uri:
                    user.profile_picture_url ||
                    "https://ui-avatars.com/api/?name=User",
                }}
                style={styles.menuAvatar}
              />
              <View style={styles.menuUserInfo}>
                <Text style={styles.menuUserName}>
                  {user.full_name || "Usuario"}
                </Text>
                {user.role_name && (
                  <View
                    style={[
                      styles.menuRoleBadge,
                      {
                        backgroundColor:
                          user.role_name === "COMMERCE" ||
                          user.role_name === "Comercio"
                            ? "#4CAF50"
                            : "#FF6B35",
                      },
                    ]}
                  >
                    <Text style={styles.menuRoleBadgeText}>
                      {user.role_name === "COMMERCE" ||
                      user.role_name === "Comercio"
                        ? "Comerciante"
                        : user.role_name}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleNavigateToDashboard}
            >
              <LayoutDashboard size={18} color="#333" />
              <Text style={styles.menuItemText}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                (navigation as any).navigate("Rewards");
              }}
            >
              <GiftIcon size={18} color="#333" />
              <Text style={styles.menuItemText}>Mis Premios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                (navigation as any).navigate("UserResources");
              }}
            >
              <Percent size={18} color="#333" />
              <Text style={styles.menuItemText}>Mis Beneficios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                (navigation as any).navigate("Orders");
              }}
            >
              <PackageIcon size={18} color="#333" />
              <Text style={styles.menuItemText}>Mis Ordenes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                (navigation as any).navigate("WalletSettingsScreen");
              }}
            >
              <Settings size={18} color="#333" />
              <Text style={styles.menuItemText}>Wallet</Text>
            </TouchableOpacity>

            {/* Mostrar opción solo si el usuario NO es comerciante */}
            {!(
              user?.role_name === "COMMERCE" || user?.role_name === "Comercio"
            ) && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setShowCommerceAlert(true);
                }}
              >
                <Store size={18} color="#333" />
                <Text style={styles.menuItemText}>Hacerme comerciante</Text>
              </TouchableOpacity>
            )}

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <LogOut size={20} color="#E53935" />
              <Text style={[styles.menuItemText, { color: "#E53935" }]}>
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal para confirmar cambio de rol a comerciante */}
      {showCommerceAlert && (
        <Modal
          transparent={true}
          visible={showCommerceAlert}
          animationType="fade"
        >
          <Pressable
            style={styles.overlay}
            onPress={() => setShowCommerceAlert(false)}
          />
          <View style={[styles.menuDropdown, { top: 120 }]}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              ¿Quieres convertirte en comerciante?
            </Text>
            <Text style={{ marginBottom: 16 }}>
              Esto actualizará tu perfil y habilitará la recepción de pagos por
              QR.
            </Text>
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: "#1E90FF" }]}
              onPress={handleChangeRoleToCommerce}
              disabled={isChangingRole}
            >
              <Text style={[styles.menuItemText, { color: "#fff" }]}>
                Confirmar
              </Text>
              {isChangingRole && (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { marginTop: 8 }]}
              onPress={() => setShowCommerceAlert(false)}
            >
              <Text style={styles.menuItemText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },

  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  loginText: {
    fontWeight: "600",
    fontSize: 14,
  },

  avatarContainer: {
    width: 45,
    height: 40,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 50,
  },

  modalOverlay: {
    flex: 1,
  },

  menuDropdown: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: 250,
    elevation: 8,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#FF6B35",
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    gap: 12,
  },

  menuAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FF6B35",
  },

  menuUserInfo: {
    flex: 1,
  },

  menuUserName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },

  menuRoleBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },

  menuRoleBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#fff",
  },

  menuDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#fff",
  },

  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
});
