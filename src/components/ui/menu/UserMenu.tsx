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
  Ticket,
  ArrowRight,
  UserRound,
  Landmark,
} from "lucide-react-native";
import { authService } from "@/services";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { useNotify } from "src/hooks";
import { getBackendErrorMessage } from "src/services";
import {
  OrganizationRegistrationModal,
  MerchantFormData,
} from "../OrganizationRegistrationModal";
import {
  organizationService,
  CreateOrganizationDto,
} from "src/services/OrganizationApiService";
import { eventStore } from "src/stores";
import SuccessModal from "src/components/ui/SuccessModal";
import { Button } from "src/components/shared";
import { colors } from "src/design-system";
import { Animated, Easing, Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";

interface UserMenuProps {
  style?: any;
  variant?: "compact" | "full";
  iconColor?: string;
}
type UserRole = "USER" | "ADMIN" | "SUPERADMIN" | "COMMERCE";
type MenuRoutes =
  | "DASHBOARD"
  | "ENTRIES"
  | "ORDERS"
  | "WALLET"
  | "ORDERSADMIN"
  | "FINANCESADMIN"
  | "EVENTADMIN";
export const UserMenu: React.FC<UserMenuProps> = ({
  style,
  variant = "compact",
  iconColor = "#fff",
}) => {
  const { navigate } = useCustomNavigation();
  const { user, isLoading, logout, reloadUser } = useAuth();
  const notify = useNotify();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const [showOrganizationModal, setShowOrganizationModal] = useState(false);
  const [isCreatingOrganization, setIsCreatingOrganization] = useState(false);
  const pendingEvents = eventStore.getState().pendingEvents;
  const [hasPendingEvents, setHasPendingEvents] = useState<boolean>(
    pendingEvents.length > 0,
  );
  useEffect(() => {
    if (menuVisible) {
      setIsMounted(true);

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (isMounted) {
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsMounted(false);
      });
    }
  }, [menuVisible]);
  const handleLogout = async () => {
    setMenuVisible(false);
    logout();
    notify.info({ message: "Cerrando sesión..." });
    navigate("MainTabs", { screen: "Home" });
  };

  const toggleMenu = () => {
    setMenuVisible((prev) => !prev);
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined,
  );
  const handleNavigate = (screen: MenuRoutes) => {
    setMenuVisible(false);
    switch (screen) {
      case "DASHBOARD":
        navigate("UserDashboardScreen");
        break;
      case "ENTRIES":
        navigate("MisEntradas", { tab: "Próximos" });
        break;
      case "ORDERS":
        navigate("Orders", { screen: "OrdersList" });
        break;
      // DESACTIVADO TEMPORALMENTE POR DEFINIR FUNCIONALIDAD DE WALLET
      // case "WALLET":
      //   navigate("WalletSettingsScreen");
      //   break;
      case "FINANCESADMIN":
        navigate("UserDashboardScreen", { screen: "FinancesManagement" });
        break;
      case "ORDERSADMIN":
        navigate("UserDashboardScreen", { screen: "OrdersManagement" });
        break;
      case "EVENTADMIN":
        navigate("UserDashboardScreen", { screen: "EventsManagement" });
        break;
    }
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
          cleanedData as CreateOrganizationDto,
        );
        notify.success({ message: "Eres comerciante ahora" });
        reloadUser();
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

      // Close the modal and show success modal
      setShowOrganizationModal(false);
      setSuccessMessage("¡Tu organización ha sido registrada exitosamente!");
      setShowSuccessModal(true);
    } catch (err) {
      // Only reach here if organization creation failed
      console.error("Error in organization creation:", err);
    } finally {
      setIsCreatingOrganization(false);
    }
  };
  const handleDeleteOrganization = async () => {
    try {
      if (!user) return;
      const actualMerchants = await organizationService.getUserOrganization(
        user.id,
      );
      if (!actualMerchants) {
        notify.error({ message: "No pudimos sincronizar los datos" });
        return;
      }
      await organizationService.disactivateOrganization(actualMerchants?.id);
      notify.success({ message: "Ya no eres comerciante" });
      reloadUser();
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
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
  const MENU_CONTENT: Record<UserRole, React.ReactNode> = {
    USER: (
      <View className="gap-2">
        <Button
          title="Dashboard"
          variant="box"
          icon={<LayoutDashboard size={18} color="#333" />}
          onPress={() => handleNavigate("DASHBOARD")}
          className="justify-start"
        />
        <View className="relative">
          <Button
            title="Mis entradas"
            onPress={() => handleNavigate("ENTRIES")}
            variant="box"
            icon={<Ticket size={18} color="#333" />}
            className="justify-start"
          />
          {hasPendingEvents && (
            <View
              style={styles.badgeContainer}
              className="absolute top-0 right-0 w-1 h-1 rounded-full bg-beland-orange-500"
            />
          )}
        </View>
        <Button
          title="Mis ordenes"
          onPress={() => handleNavigate("ORDERS")}
          variant="box"
          icon={<PackageIcon size={18} color="#333" />}
          className="justify-start"
        />
        <Button
          title="Mi wallet"
          onPress={() => handleNavigate("WALLET")}
          variant="box"
          icon={<Settings size={18} color="#333" />}
          className="justify-start"
        />
        {/* Mostrar opción solo si el usuario NO es comerciante */}

        {user.role.name !== "COMERCIO" && (
          <Button
            title="Hacerme comerciante"
            onPress={handleOpenOrganizationModal}
            variant="box"
            icon={<Store size={18} color="#333" />}
            className="justify-start"
          />
        )}
      </View>
    ),
    ADMIN: (
      <View className="gap-2">
        <Button
          title="Dashboard"
          variant="box"
          icon={<LayoutDashboard size={18} color="#333" />}
          onPress={() => handleNavigate("DASHBOARD")}
          className="justify-start"
        />
      </View>
    ),
    SUPERADMIN: (
      <View className="gap-2">
        <Button
          title="Dashboard"
          variant="box"
          icon={<LayoutDashboard size={18} color="#333" />}
          onPress={() => handleNavigate("DASHBOARD")}
          className="justify-start"
        />
        <Button
          title="Ordenes"
          variant="box"
          icon={<PackageIcon size={18} color="#333" />}
          onPress={() => handleNavigate("ORDERSADMIN")}
          className="justify-start"
        />
        <Button
          title="Finanzas"
          variant="box"
          icon={<Landmark size={18} color="#333" />}
          onPress={() => handleNavigate("FINANCESADMIN")}
          className="justify-start"
        />
        <Button
          title="Eventos"
          variant="box"
          icon={<Landmark size={18} color="#333" />}
          onPress={() => handleNavigate("EVENTADMIN")}
          className="justify-start"
        />
      </View>
    ),
    COMMERCE: (
      <View className="gap-2">
        <Button
          title="Dashboard"
          variant="box"
          icon={<LayoutDashboard size={18} color="#333" />}
          onPress={() => handleNavigate("DASHBOARD")}
          className="justify-start"
        />
        <Button
          title="Hacerme comerciante"
          onPress={handleOpenOrganizationModal}
          variant="box"
          icon={<Store size={18} color="#333" />}
          className="justify-start"
        />
        <Button
          title="Dejar de ser comerciante"
          onPress={handleDeleteOrganization}
          variant="box"
          icon={<Store size={18} color="#333" />}
          className="justify-start"
        />
      </View>
    ),
  };
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

      {isMounted && (
        <Modal transparent animationType="none">
          <Pressable style={styles.modalOverlay} onPress={toggleMenu}>
            <Animated.View
              style={[
                styles.menuDropdown,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              {/* Header del menú con info del usuario */}
              <View style={styles.menuHeader}>
                <View style={styles.menuAvatar}>
                  {user.profile_picture_url ? (
                    <Image
                      source={{
                        uri: user.profile_picture_url,
                      }}
                      style={{ width: 45, height: 45 }}
                    />
                  ) : (
                    <UserRound color="orange" />
                  )}
                </View>

                <View className="px-4">
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
                <Button
                  onPress={toggleMenu}
                  title="Cerrar menu"
                  variant="onlyIcon"
                  icon={<ArrowRight color="orange" />}
                />
              </View>
              <View style={styles.menuDivider} />
              <View className="p-4">
                {/* CONTENT BY ROLE */}
                {MENU_CONTENT[user.role_name as UserRole]}
              </View>
              <View style={styles.menuDivider} className="mt-auto" />
              <View className="px-6 pb-4">
                <Button
                  title="Cerrar sesión"
                  onPress={handleLogout}
                  variant="box"
                  icon={<LogOut size={20} color="#E53935" />}
                  className="justify-start"
                  textStyle={{ color: "red" }}
                />
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      )}

      {/* Modal de registro de organización */}
      <OrganizationRegistrationModal
        visible={showOrganizationModal}
        onClose={() => setShowOrganizationModal(false)}
        onSubmit={handleCreateOrganization}
        isLoading={isCreatingOrganization}
      />
      <SuccessModal
        visible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
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
    top: 16,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderWidth: 2,
    borderRightWidth: 0,
    borderColor: "rgba(255,255,255,0.3)",
    minWidth: 250,
    height: "90%",
    elevation: 8,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    zIndex: 1000,
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 6,
  },

  menuAvatar: {
    width: 50,
    height: 50,
    borderBottomRightRadius: 25,
    borderTopLeftRadius: 16,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: colors.brand.orange[200],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
    marginVertical: 12,
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
    backgroundColor: colors.brand.orange[500],
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
});
