import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import {
  TreesIcon,
  CommunityIcon,
  GiftIcon,
  RecycleIcon,
  DeliveryIcon,
} from "../../../components/icons";
import { useResponsiveLayout } from "@/hooks";
import { FileQuestionMark } from "lucide-react-native";
interface FeatureCardProps {
  type: "recycling" | "community" | "delivery" | "faq";
  onPress?: () => void;
  data?: any;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  type,
  onPress,
  data,
}) => {
  const { isMobile, screenWidth } = useResponsiveLayout();
  const getCardContent = () => {
    switch (type) {
      case "recycling":
        return {
          icon: <RecycleIcon width={48} height={48} color="#10B981" />,
          title: "Reciclaje",
          subtitle: `${((data?.bottlesRecycled || 0) * 0.025).toFixed(
            1,
          )} kg reciclados`,
          description:
            "Encuentra puntos de reciclaje cerca de ti y suma BeCoins",
          color: "#10B981",
          bgColor: "#D1FAE5",
        };
      case "community":
        return {
          icon: <GiftIcon width={48} height={48} />,
          title: "Comunidad",
          subtitle: "Explora beneficios",
          description:
            "Descubre productos y descuentos exclusivos para miembros",
          color: "#8B5CF6",
          bgColor: "#EDE9FE",
        };
      case "delivery":
        return {
          icon: <DeliveryIcon width={48} height={48} color="#0F766E" />,
          title: "Delivery Circular",
          subtitle: "Explora, compra y recibe a domicilio",
          description:
            "Entréganos tus residuos, apoya a recicladores y gana monedas por cuidar el planeta.",
          color: "#0F766E",
          bgColor: "#CCFBF1",
        };
      case "faq":
        return {
          icon: <FileQuestionMark width={48} height={48} color="#0F766E" />,
          title: "Preguntas Frecuentes",
          subtitle: "Descubrí Beland",
          description:
            "Enterate como sacar beneficio a la App y todas sus ventajas.",
          color: "#0F766E",
          bgColor: "#CCFBF1",
        };
      default:
        return {
          icon: null,
          title: "",
          subtitle: "",
          description: "",
          color: "#6B7280",
          bgColor: "#F3F4F6",
        };
    }
  };

  const content = getCardContent();

  // Estilos dinámicos basados en el tamaño de pantalla
  const dynamicStyles = StyleSheet.create({
    container: {
      ...styles.container,
      ...(Platform.OS === "web" &&
        isMobile && {
          padding: screenWidth < 480 ? 16 : 20,
          minHeight: screenWidth < 480 ? 90 : 100,
          marginHorizontal: screenWidth < 480 ? 12 : 16,
          marginVertical: screenWidth < 480 ? 6 : 8,
          borderRadius: screenWidth < 480 ? 16 : 24,
          flex: "none" as any,
        }),
    },
    iconContainer: {
      ...styles.iconContainer,
      ...(Platform.OS === "web" &&
        screenWidth < 480 && {
          width: 56,
          height: 56,
          borderRadius: 14,
          marginRight: 12,
        }),
    },
    title: {
      ...styles.title,
      ...(Platform.OS === "web" &&
        screenWidth < 480 && {
          fontSize: 16,
          marginBottom: 3,
        }),
    },
    subtitle: {
      ...styles.subtitle,
      ...(Platform.OS === "web" &&
        screenWidth < 480 && {
          fontSize: 13,
          marginBottom: 6,
        }),
    },
    description: {
      ...styles.description,
      ...(Platform.OS === "web" &&
        screenWidth < 480 && {
          fontSize: 12,
          lineHeight: 16,
        }),
    },
    arrow: {
      ...styles.arrow,
      ...(Platform.OS === "web" &&
        screenWidth < 480 && {
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 8,
          marginLeft: 8,
        }),
    },
  });

  return (
    <TouchableOpacity
      style={[dynamicStyles.container, { borderColor: content.color }]}
      onPress={onPress}
      activeOpacity={0.8}
      key={content.title}
    >
      <View
        style={[
          dynamicStyles.iconContainer,
          { backgroundColor: content.bgColor },
        ]}
      >
        {content.icon}
      </View>

      <View style={styles.textContainer}>
        <Text style={[dynamicStyles.title, { color: content.color }]}>
          {content.title}
        </Text>
        <Text style={dynamicStyles.subtitle}>{content.subtitle}</Text>
        <Text style={dynamicStyles.description}>{content.description}</Text>
      </View>

      <View style={[dynamicStyles.arrow, { borderTopColor: content.color }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: Platform.OS === "web" ? 28 : 20,
    marginHorizontal: Platform.OS === "web" ? 0 : 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    flexDirection: "row",
    alignItems: "center",
    minHeight: Platform.OS === "web" ? 120 : 100,
    flex: 1,
    minWidth: Platform.OS === "web" ? 280 : undefined,
    maxWidth: "100%",
  },
  iconContainer: {
    width: Platform.OS === "web" ? 72 : 64,
    height: Platform.OS === "web" ? 72 : 64,
    borderRadius: Platform.OS === "web" ? 18 : 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Platform.OS === "web" ? 24 : 16,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  title: {
    fontSize: Platform.OS === "web" ? 22 : 18,
    fontWeight: "800",
    marginBottom: Platform.OS === "web" ? 6 : 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Platform.OS === "web" ? 16 : 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: Platform.OS === "web" ? 10 : 8,
    textAlign: "left",
  },
  description: {
    fontSize: Platform.OS === "web" ? 15 : 13,
    color: "#6B7280",
    lineHeight: Platform.OS === "web" ? 22 : 18,
    textAlign: "left",
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: Platform.OS === "web" ? 8 : 6,
    borderRightWidth: Platform.OS === "web" ? 8 : 6,
    borderTopWidth: Platform.OS === "web" ? 12 : 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#9CA3AF",
    transform: [{ rotate: "90deg" }],
    marginLeft: Platform.OS === "web" ? 16 : 12,
    flexShrink: 0,
  },
});
