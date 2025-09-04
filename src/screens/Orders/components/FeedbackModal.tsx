import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../styles/colors";

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
  orderId: string;
  loading?: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  onSubmit,
  orderId,
  loading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, feedback);

    // Reset values
    setRating(0);
    setFeedback("");
  };

  const handleClose = () => {
    setRating(0);
    setFeedback("");
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
          disabled={loading}
        >
          <MaterialCommunityIcons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#FFD700" : "#E5E5EA"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return "Muy malo 😞";
      case 2:
        return "Malo 😕";
      case 3:
        return "Regular 😐";
      case 4:
        return "Bueno 😊";
      case 5:
        return "Excelente 🤩";
      default:
        return "Selecciona una calificación";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Califica tu experiencia</Text>

          <Text style={styles.subtitle}>Orden #{orderId.slice(-8)}</Text>

          <View style={styles.ratingContainer}>{renderStars()}</View>

          <Text style={styles.ratingText}>{getRatingText()}</Text>

          <Text style={styles.inputLabel}>Cuéntanos más (opcional):</Text>
          <TextInput
            style={styles.textInput}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Comparte tu experiencia con el producto y la entrega..."
            multiline
            numberOfLines={4}
            maxLength={500}
            editable={!loading}
          />

          <Text style={styles.characterCount}>
            {feedback.length}/500 caracteres
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                rating === 0 && styles.submitButtonDisabled,
                loading && styles.submitButtonLoading,
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || loading}
            >
              {loading ? (
                <Text style={styles.submitButtonText}>Enviando...</Text>
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={16} color="white" />
                  <Text style={styles.submitButtonText}>Enviar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 24,
    minHeight: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
    color: colors.textPrimary,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#8E8E93",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.belandOrange,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#E5E5EA",
  },
  submitButtonLoading: {
    backgroundColor: colors.belandOrange + "80",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});
