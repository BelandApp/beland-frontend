import React, { useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ShareGroupCard } from "./ShareGroupCard";
import {
  shareNative,
  captureAndShareGroupCard,
  ShareGroupData,
  shareOnWhatsApp,
} from "@/utils/shareHelper";
import Feather from "react-native-vector-icons/Feather";
import { colors } from "@/styles";
import { Button } from "./buttons";
import { WrapperModal } from "./modals";

interface ShareGroupModalProps {
  visible: boolean;
  onClose: () => void;
  groupData: ShareGroupData;
}

export const ShareGroupModal: React.FC<ShareGroupModalProps> = ({
  visible,
  onClose,
  groupData,
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [previewImageVisible, showPreviewImage] = useState<boolean>(false);

  const handleShare = async (platform: "native" | "whatsapp" | "image") => {
    setIsSharing(true);
    try {
      switch (platform) {
        case "whatsapp":
          // Usamos la misma lógica de imagen para WhatsApp ya que el usuario prefiere compartir la visual
          await shareOnWhatsApp(groupData);
          break;
        case "image":
          await captureAndShareGroupCard(cardRef, groupData);
          break;
        case "native":
        default:
          await shareNative(groupData);
          break;
      }
      onClose();
    } catch (error) {
      console.error("Error al compartir:", error);
      Alert.alert(
        "Error",
        "No se pudo compartir. Por favor, intenta de nuevo.",
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <WrapperModal
      isOpen={visible}
      onClose={onClose}
      header={<Text style={styles.title}>Compartir Grupo</Text>}
      content={
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Share Options */}
          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>¿Dónde compartir?</Text>

            {/* Share as Image (Stories) */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleShare("image")}
              disabled={isSharing}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#E4405F" }]}>
                <Feather name="instagram" size={24} color="#fff" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Stories de Instagram/TikTok
                </Text>
                <Text style={styles.optionDescription}>
                  Comparte la imagen en tus historias
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleShare("whatsapp")}
              disabled={isSharing}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#25D366" }]}>
                <Feather name="message-circle" size={24} color="#fff" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>WhatsApp</Text>
                <Text style={styles.optionDescription}>
                  Envía el enlace por WhatsApp
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>

            {/* More Options */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleShare("native")}
              disabled={isSharing}
            >
              <View
                style={[styles.optionIcon, { backgroundColor: colors.primary }]}
              >
                <Feather name="share-2" size={24} color="#fff" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Más opciones</Text>
                <Text style={styles.optionDescription}>
                  SMS, Email, Telegram, etc.
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {isSharing && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>
                Preparando para compartir...
              </Text>
            </View>
          )}
          {/* Preview Card */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Vista Previa</Text>

            <View style={[styles.cardWrapper]}>
              <ShareGroupCard
                ref={cardRef}
                groupName={groupData.groupName}
                description={groupData.description}
                memberCount={groupData.memberCount}
                creatorName={groupData.creatorName}
              />
              <Text style={styles.previewHint}>
                💡 Esta imagen se generará al compartir en Stories
              </Text>
            </View>
          </View>
        </ScrollView>
      }
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 24,
  },
  previewSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cardWrapper: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
  },
  previewHint: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  optionsSection: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  optionDescription: {
    fontSize: 13,
    color: "#666",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});
