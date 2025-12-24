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
  User,
  Settings,
  PackageIcon,
  Gift,
  Ticket,
} from "lucide-react-native";
import { authService } from "../../services/auth/auth.service";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { useNotify } from "src/hooks";
import { getBackendErrorMessage } from "src/services";
import {
  OrganizationRegistrationModal,
  MerchantFormData,
} from "./OrganizationRegistrationModal";
import {
  organizationService,
  CreateOrganizationDto,
} from "src/services/OrganizationApiService";
import { eventStore } from "src/stores";
import { colors } from "src/styles";

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
  const { navigate } = useCustomNavigation();

  const { user, isLoading, logout } = useAuth();
  const notify = useNotify();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showOrganizationModal, setShowOrganizationModal] = useState(false);
  const [isCreatingOrganization, setIsCreatingOrganization] = useState(false);
  const pendingEvents = eventStore.getState().pendingEvents;
  const [hasPendingEvents, setHasPendingEvents] = useState<boolean>(
    pendingEvents.length > 0
  );
  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    navigate("Login");
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleNavigateToDashboard = () => {
    setMenuVisible(false);
    navigate("UserDashboardScreen");
  };

  const handleOpenOrganizationModal = async () => {
    setMenuVisible(false);

    if (!user?.id) {
      notify.error({ message: "Usuario no encontrado" });
      return;
    }

    // Check if user already has an organization
    try {
      const existingOrganization =
        await organizationService.getUserOrganization(user.id);
      if (existingOrganization) {
        notify.error({
          message:
            "Ya tienes una organización registrada. Solo puedes tener una organización por usuario.",
        });
        return;
      }
      // If no organization exists, open the modal
      setShowOrganizationModal(true);
    } catch (error) {
      console.error("Error checking organization:", error);
      // If there's an error checking, allow opening the modal anyway
      setShowOrganizationModal(true);
    }
  };

  const handleCreateOrganization = async (data: MerchantFormData) => {
    if (!user?.id) {
      notify.error({ message: "Usuario no encontrado" });
      return;
    }

    setIsCreatingOrganization(true);
    try {
      // Filter out empty optional fields to match the backend CreateMerchantDto
      const cleanedData: Partial<CreateOrganizationDto> = {
        name: data.name,
      };

      // Only include optional fields if they have valid values
      if (data.legal_name?.trim())
        cleanedData.legal_name = data.legal_name.trim();
      if (data.ruc?.trim()) cleanedData.ruc = data.ruc.trim();
      // Backend no longer accepts `category` or raw address fields — omit them.
      // Step 1: Address is required by backend via `address_id`. Create it first.
      try {
        if (!data.address || !data.city || !data.country) {
          notify.error({
            message: "La dirección, ciudad y país son requeridos",
          });
          setIsCreatingOrganization(false);
          return;
        }

        // Validate RUC length if provided
        if (
          data.ruc &&
          data.ruc.trim().length > 0 &&
          data.ruc.trim().length < 5
        ) {
          notify.error({ message: "El RUC debe tener al menos 5 caracteres" });
          setIsCreatingOrganization(false);
          return;
        }

        // Map to CreateAddressRequest using the raw form `data`
        const addressPayload: any = {
          addressLine1: data.address,
          city: data.city,
          state: data.province || undefined,
          country: data.country,
          latitude: (data as any).latitude,
          longitude: (data as any).longitude,
          isDefault: false,
        };

        // Create address and obtain id
        const createdAddress = await (
          await import("src/services/addressService")
        ).addressService.createAddress(addressPayload);
        // Attach address_id for merchant creation
        (cleanedData as any).address_id = createdAddress.id;

        // Only include RUC if it meets length requirements
        if (data.ruc?.trim() && data.ruc.trim().length >= 5) {
          cleanedData.ruc = data.ruc.trim();
        }

        if (data.legal_name?.trim())
          cleanedData.legal_name = data.legal_name.trim();
        if (data.description?.trim())
          cleanedData.description = data.description.trim();
        if (data.phone?.trim() && data.phone.length >= 5)
          cleanedData.phone = data.phone.trim();
        if (data.email?.trim() && data.email.includes("@"))
          cleanedData.email = data.email.trim();
        if (data.logo_url?.trim()) cleanedData.logo_url = data.logo_url.trim();
        if (
          data.website?.trim() &&
          (data.website.startsWith("http://") ||
            data.website.startsWith("https://"))
        ) {
          cleanedData.website = data.website.trim();
        }

        await organizationService.createOrganization(
          cleanedData as CreateOrganizationDto
        );
      } catch (orgError) {
        const message = getBackendErrorMessage(orgError);
        notify.error({ message });
        throw orgError; // Re-throw to prevent continuing
      }

      // Step 2: Change user role to COMMERCE
      let roleChangeResponse;
      try {
        roleChangeResponse = await authService.changeRoleToCommerce();
      } catch (roleError) {
        // Organization was created but role change failed
        console.error("Role change failed:", roleError);
        // Don't show error since organization was created successfully
        // The role will be updated when they refresh or login again
      }

      // Step 3: Refresh user data if role change was successful
      if (roleChangeResponse?.token) {
        try {
          await authService.getCurrentUser(roleChangeResponse.token);
        } catch (userError) {
          console.error("User refresh failed:", userError);
          // Don't show error, the user data will refresh on next navigation
        }
      }

      // Close the modal
      setShowOrganizationModal(false);

      // Show success message
      notify.success({
        message: "¡Tu organización ha sido registrada exitosamente!",
      });
    } catch (err) {
      // Only reach here if organization creation failed
      console.error("Error in organization creation:", err);
    } finally {
      setIsCreatingOrganization(false);
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
        onPress={() => navigate("Login")}
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
            {/* TODO REVISAR SI ES NECESARIO */}
            {/* <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                (navigation as any).navigate("Rewards");
              }}
            >
              <GiftIcon size={18} color="#333" />
              <Text style={styles.menuItemText}>Mis Premios</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigate("MisEntradas");
              }}
            >
              <Ticket size={18} color="#333" />
              <Text style={styles.menuItemText}>Mis Entradas</Text>
              {hasPendingEvents && <View style={styles.badgeContainer} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigate("Orders", { screen: "OrdersList" });
              }}
            >
              <PackageIcon size={18} color="#333" />
              <Text style={styles.menuItemText}>Mis Ordenes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigate("WalletSettingsScreen");
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
                onPress={handleOpenOrganizationModal}
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

      {/* Modal de registro de organización */}
      <OrganizationRegistrationModal
        visible={showOrganizationModal}
        onClose={() => setShowOrganizationModal(false)}
        onSubmit={handleCreateOrganization}
        isLoading={isCreatingOrganization}
      />
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
  badgeContainer: {
    width: 5,
    height: 5,
    borderRadius: 50,
    backgroundColor: colors.belandOrange,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
});
