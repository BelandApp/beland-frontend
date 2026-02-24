import React, { useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/styles";
import Feather from "react-native-vector-icons/Feather";
import { Image } from "react-native";

interface ShareGroupCardProps {
  groupName: string;
  description?: string;
  memberCount?: number;
  creatorName?: string;
}

/**
 * Componente visual para compartir en redes sociales
 * Se puede capturar como imagen con react-native-view-shot
 */
export const ShareGroupCard = React.forwardRef<View, ShareGroupCardProps>(
  ({ groupName, description, memberCount = 0, creatorName }, ref) => {
    const screenWidth = Dimensions.get("window").width;
    const cardWidth = Math.min(screenWidth * 0.9, 400);

    return (
      <View
        ref={ref}
        collapsable={false}
        style={[styles.container, { width: cardWidth }]}
      >
        <LinearGradient
          colors={[colors.primary, "#00b35f", "#008f4a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Logo/Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>BELAND</Text>
          </View>

          {/* Icono principal */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Feather name="users" size={48} color={colors.primary} />
            </View>
          </View>

          {/* Contenido */}
          <View style={styles.content}>
            <Text style={styles.invitation}>¡Te invito a unirte!</Text>

            <Text style={styles.groupName} numberOfLines={2}>
              {groupName}
            </Text>

            {description && (
              <Text style={styles.description} numberOfLines={3}>
                {description}
              </Text>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Feather name="users" size={16} color="#ffffff99" />
                <Text style={styles.statText}>
                  {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
                </Text>
              </View>
              {creatorName && (
                <View style={styles.stat}>
                  <Feather name="user" size={16} color="#ffffff99" />
                  <Text style={styles.statText}>Por {creatorName}</Text>
                </View>
              )}
            </View>

            {/* CTA */}
            <View style={styles.ctaContainer}>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>Descarga Beland</Text>
                <Feather name="download" size={18} color={colors.primary} />
              </View>
            </View>

            {/* QR Code placeholder - puedes agregar un QR real después */}
            <View style={styles.qrPlaceholder}>
              <Image
                source={require("../../../assets/beland_qr.png")}
                width={150}
                height={150}
                style={{ maxWidth: 150, maxHeight: 150 }}
              />
              <Text style={styles.qrText}>Escanea para unirte</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>beland.app</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    aspectRatio: 9 / 16, // Formato Stories
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  gradient: {
    flex: 1,
    padding: 32,
    justifyContent: "space-between",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff22",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ffffff44",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    marginTop: 42,
    justifyContent: "center",
    gap: 16,
  },
  invitation: {
    color: "#ffffffcc",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  groupName: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 38,
  },
  description: {
    color: "#ffffffdd",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 8,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    color: "#ffffffaa",
    fontSize: 14,
    fontWeight: "500",
  },
  ctaContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  qrPlaceholder: {
    alignItems: "center",
    marginTop: 24,
  },
  qrText: {
    color: "#ffffff88",
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#ffffff22",
  },
  footerText: {
    color: "#ffffffaa",
    fontSize: 14,
    fontWeight: "600",
  },
});
