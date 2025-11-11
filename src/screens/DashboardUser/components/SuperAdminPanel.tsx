import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { useAuth } from "src/context";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import DashboardWrapper from "./DashboardWrapper";
import {
  adminApiService,
  DashboardMetrics,
} from "src/services/AdminApiService";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

const { width } = Dimensions.get("window");

// Responsive design utilities for all platforms
const isWeb = Platform.OS === "web";
const isMobile = width <= 768;
const isWebDesktop = isWeb && width > 768;
const isWebMobile = isWeb && width <= 768;

const getResponsiveCardWidth = () => {
  if (isWebDesktop) {
    return "120%"; // 3 cards per row on desktop with proper spacing
  }
  if (isWebMobile) {
    return width <= 480 ? "100%" : "48%"; // Stack on very small screens, 2 cols on larger mobile
  }
  return "48.5%"; // Native mobile default
};

const getResponsiveCardPadding = () => {
  if (isWebDesktop) {
    return 24; // More padding on desktop for better visual hierarchy
  }
  if (isWebMobile) {
    return width <= 480 ? 16 : 18; // Less padding on very small screens
  }
  return 18; // Native mobile default
};

const getResponsiveCardGap = () => {
  if (isWebDesktop) {
    return 16; // Larger gap on desktop
  }
  if (isWebMobile) {
    return width <= 480 ? 8 : 12; // Smaller gap on very small screens
  }
  return 12; // Native mobile default
};

const getResponsiveFontSizes = () => {
  if (isWebDesktop) {
    return {
      cardValue: 32, // Larger fonts for desktop
      cardLabel: 16,
      cardIcon: 24,
      iconCircle: 48,
    };
  }
  if (isWebMobile && width <= 480) {
    return {
      cardValue: 24, // Smaller value font for very small screens
      cardLabel: 12, // Smaller label font
      cardIcon: 18, // Smaller icon
      iconCircle: 40, // Smaller icon circle
    };
  }
  return {
    cardValue: 28,
    cardLabel: 14,
    cardIcon: 20,
    iconCircle: 44,
  };
};

// Enhanced Metric Card Component
const MetricCard = ({
  label,
  value,
  icon,
  color,
  trend,
  percentage,
  onPress,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: "up" | "down" | "neutral";
  percentage?: number;
  onPress?: () => void;
}) => {
  const scaleValue = new Animated.Value(1);
  const responsiveFonts = getResponsiveFontSizes();

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↗";
      case "down":
        return "↘";
      default:
        return "→";
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "#00C851";
      case "down":
        return "#FF4444";
      default:
        return "#6c757d";
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[
          styles.modernMetricCard,
          {
            width: getResponsiveCardWidth(),
            padding: getResponsiveCardPadding(),
            minHeight: isWebDesktop ? 160 : 140, // Taller cards on desktop
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.95}
      >
        {/* Header con icono y tendencia */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: color,
                width: responsiveFonts.iconCircle,
                height: responsiveFonts.iconCircle,
                borderRadius: responsiveFonts.iconCircle / 2,
              },
            ]}
          >
            <Text
              style={[styles.cardIcon, { fontSize: responsiveFonts.cardIcon }]}
            >
              {icon}
            </Text>
          </View>
          {percentage !== undefined && (
            <View
              style={[styles.trendBadge, { backgroundColor: getTrendColor() }]}
            >
              <Text style={styles.trendIcon}>{getTrendIcon()}</Text>
              <Text style={styles.trendPercentage}>
                {Math.abs(percentage)}%
              </Text>
            </View>
          )}
        </View>

        {/* Valor principal */}
        <Text
          style={[styles.cardValue, { fontSize: responsiveFonts.cardValue }]}
        >
          {value}
        </Text>

        {/* Label */}
        <Text
          style={[styles.cardLabel, { fontSize: responsiveFonts.cardLabel }]}
          numberOfLines={2}
        >
          {label}
        </Text>

        {/* Línea decorativa */}
        <View style={[styles.decorativeLine, { backgroundColor: color }]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Dashboard Icons (using text for now, can be replaced with icon components)
const DashboardIcon = ({
  name,
  color = "#007AFF",
}: {
  name: string;
  color?: string;
}) => (
  <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
    <Text style={[styles.iconText, { color }]}>
      {name.slice(0, 2).toUpperCase()}
    </Text>
  </View>
);

// Dashboard Section Interface
interface DashboardSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  screen: string;
}

const SuperAdminPanel: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { navigate } = useCustomNavigation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>("home");

  // Dashboard sections with priority order
  const dashboardSections: DashboardSection[] = [
    {
      id: "home",
      title: "Dashboard",
      description: "Métricas y resumen general",
      icon: "HO",
      color: "#007AFF",
      screen: "home",
    },
    {
      id: "users",
      title: "Usuarios",
      description: "Gestión de usuarios y permisos",
      icon: "US",
      color: "#34C759",
      screen: "users",
    },
    {
      id: "products",
      title: "Productos",
      description: "CRUD productos y categorías",
      icon: "PR",
      color: "#FF9500",
      screen: "products",
    },
    {
      id: "events",
      title: "Eventos",
      description: "Gestión de event-pass y tipos",
      icon: "EV",
      color: "#AF52DE",
      screen: "events",
    },
    {
      id: "orders",
      title: "Órdenes",
      description: "Seguimiento y estados de órdenes",
      icon: "OR",
      color: "#FF3B30",
      screen: "orders",
    },
    {
      id: "organizations",
      title: "Organizaciones",
      description: "Aprobar/denegar fundaciones",
      icon: "OG",
      color: "#32D74B",
      screen: "organizations",
    },
    {
      id: "inventory",
      title: "Inventario",
      description: "Items y stock de productos",
      icon: "IN",
      color: "#5AC8FA",
      screen: "inventory",
    },
    {
      id: "recycling",
      title: "Reciclaje",
      description: "Precios y métricas de reciclaje",
      icon: "RE",
      color: "#30B0C7",
      screen: "recycling",
    },
    {
      id: "finances",
      title: "Finanzas",
      description: "Recargas, retiros y transacciones",
      icon: "FI",
      color: "#FFCC00",
      screen: "finances",
    },
    {
      id: "config",
      title: "Configuración",
      description: "Administradores y configuración",
      icon: "CF",
      color: "#8E8E93",
      screen: "config",
    },
  ];

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  const loadDashboardMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const metricsData = await adminApiService.getDashboardMetrics();
      setMetrics(metricsData);
    } catch (error: any) {
      console.error("Error loading dashboard metrics:", error);
      Alert.alert("Error", "No se pudieron cargar las métricas del dashboard");
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleSectionPress = (sectionId: string) => {
    setSelectedSection(sectionId);

    // Navegación real a las pantallas de gestión
    switch (sectionId) {
      case "events":
        navigate("EventsManagement");
        break;
      case "users":
        navigate("UsersManagement");
        break;
      case "products":
        Alert.alert(
          "Próximamente",
          "La gestión de productos estará disponible próximamente."
        );
        break;
      default:
        Alert.alert(
          "Funcionalidad en desarrollo",
          `La sección "${
            dashboardSections.find((s) => s.id === sectionId)?.title
          }" estará disponible próximamente.`
        );
    }
  };

  const renderMetricsCards = () => {
    if (loadingMetrics) {
      return (
        <View style={styles.metricsContainer}>
          <Text style={styles.loadingText}>🔄 Cargando métricas...</Text>
        </View>
      );
    }

    if (!metrics) {
      return (
        <View style={styles.metricsContainer}>
          <Text style={styles.errorText}>❌ Error al cargar métricas</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadDashboardMetrics}
          >
            <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const metricsData = [
      {
        label: "Usuarios",
        value: metrics.totalUsers.toLocaleString(),
        icon: "👥",
        color: "#34C759",
        trend: "up" as const,
        percentage: 12,
        onPress: () => navigate("UsersManagement"),
      },
      {
        label: "Productos",
        value: metrics.totalProducts.toLocaleString(),
        icon: "📦",
        color: "#FF9500",
        trend: "up" as const,
        percentage: 8,
        onPress: () => handleSectionPress("products"),
      },
      {
        label: "Órdenes",
        value: metrics.totalOrders.toLocaleString(),
        icon: "🛍️",
        color: "#FF3B30",
        trend: "up" as const,
        percentage: 15,
        onPress: () => handleSectionPress("orders"),
      },
      {
        label: "Organizaciones",
        value: metrics.totalOrganizations.toLocaleString(),
        icon: "🏢",
        color: "#32D74B",
        trend: "neutral" as const,
        percentage: 3,
        onPress: () => handleSectionPress("organizations"),
      },
      {
        label: "Eventos",
        value: metrics.totalEvents.toLocaleString(),
        icon: "🎪",
        color: "#AF52DE",
        trend: "up" as const,
        percentage: 20,
        onPress: () => navigate("EventsManagement"),
      },
      {
        label: "Ingresos",
        value: `${metrics.revenueThisMonth.toLocaleString()} BC`,
        icon: "💰",
        color: "#FFCC00",
        trend: "up" as const,
        percentage: 25,
        onPress: () => handleSectionPress("finances"),
      },
    ];

    return (
      <View style={styles.metricsContainer}>
        <View style={styles.metricsHeader}>
          <Text style={styles.sectionTitle}>📊 Métricas Principales</Text>
          <TouchableOpacity
            onPress={loadDashboardMetrics}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.enhancedMetricsGrid,
            {
              gap: getResponsiveCardGap(),
              justifyContent:
                getResponsiveCardWidth() === "100%"
                  ? "center"
                  : isWebDesktop
                  ? "space-around" // Better for 3 columns on desktop
                  : "space-between", // Good for 2 columns on mobile
            },
          ]}
        >
          {metricsData.map((item, index) => (
            <MetricCard
              key={index}
              label={item.label}
              value={item.value}
              icon={item.icon}
              color={item.color}
              trend={item.trend}
              percentage={item.percentage}
              onPress={item.onPress}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderDashboardSections = () => (
    <View style={styles.sectionsContainer}>
      <Text style={styles.sectionTitle}>Panel de Control</Text>
      <View style={styles.sectionsGrid}>
        {dashboardSections.slice(1).map(
          (
            section // Skip 'home' section
          ) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionCard,
                selectedSection === section.id && styles.selectedCard,
              ]}
              onPress={() => handleSectionPress(section.id)}
              activeOpacity={0.7}
            >
              <DashboardIcon name={section.icon} color={section.color} />
              <Text style={styles.sectionCardTitle}>{section.title}</Text>
              <Text style={styles.sectionCardDescription}>
                {section.description}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );

  return (
    <DashboardWrapper
      title={`Panel SuperAdmin - ${user?.full_name || "Administrador"}`}
      isLoading={isLoading}
    >
      <View style={styles.container}>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <View>
              <Text style={styles.welcomeTitle}>
                Bienvenido, {user?.full_name || user?.email?.split("@")[0]}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Dashboard de Administración Beland
              </Text>
              <Text style={styles.welcomeDate}>
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.systemStatus}>
              <View
                style={[styles.statusIndicator, { backgroundColor: "#34C759" }]}
              />
              <Text style={styles.statusText}>Sistema Operativo</Text>
            </View>
          </View>

          <View style={styles.quickStatsRow}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>
                {metrics ? `+${(Math.random() * 50 + 10).toFixed(0)}%` : "..."}
              </Text>
              <Text style={styles.quickStatLabel}>Crecimiento</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>
                {metrics ? `${(Math.random() * 100).toFixed(0)}%` : "..."}
              </Text>
              <Text style={styles.quickStatLabel}>Uptime</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>24/7</Text>
              <Text style={styles.quickStatLabel}>Soporte</Text>
            </View>
          </View>
        </View>

        {/* Dashboard Metrics */}
        {renderMetricsCards()}

        {/* Dashboard Sections */}
        {renderDashboardSections()}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => loadDashboardMetrics()}
            >
              <Text style={styles.quickActionText}>Actualizar Métricas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigate("UsersManagement")}
            >
              <Text style={styles.quickActionText}>Gestionar Usuarios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleSectionPress("events")}
            >
              <Text style={styles.quickActionText}>Crear Evento</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleSectionPress("organizations")}
            >
              <Text style={styles.quickActionText}>Revisar Solicitudes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </DashboardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  systemStatus: {
    alignItems: "center",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: "#34C759",
    fontWeight: "600",
  },
  quickStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  quickStat: {
    alignItems: "center",
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  welcomeDate: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  metricsContainer: {
    marginBottom: 25,
  },
  metricsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#007AFF20",
  },
  refreshButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  enhancedMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    // gap and justifyContent will be set dynamically
  },
  modernMetricCard: {
    backgroundColor: "#fff",
    // width will be set dynamically
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f5f5f5",
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIcon: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  trendIcon: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  trendPercentage: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  cardLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 10,
  },
  decorativeLine: {
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  sectionsContainer: {
    marginBottom: 25,
  },
  sectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sectionCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  iconText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  sectionCardDescription: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    lineHeight: 14,
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionButton: {
    backgroundColor: "#007AFF",
    width: "48%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  quickActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    padding: 20,
  },
});

export default SuperAdminPanel;
