import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../styles/colors";

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => Promise<void>;
  orderId: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  onSubmit,
  orderId,
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(
        "Calificación requerida",
        "Por favor selecciona una calificación"
      );
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(rating, feedback);

      // Reset form
      setRating(0);
      setFeedback("");
      onClose();

      Alert.alert("¡Gracias!", "Tu calificación ha sido enviada exitosamente");
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la calificación");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color={star <= rating ? "#FFD700" : "#E0E0E0"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return "Muy malo";
      case 2:
        return "Malo";
      case 3:
        return "Regular";
      case 4:
        return "Bueno";
      case 5:
        return "Excelente";
      default:
        return "Selecciona una calificación";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <MaterialCommunityIcons
                name="star-circle"
                size={24}
                color={colors.belandOrange}
              />
            </View>
            <Text style={styles.title}>Califica tu experiencia</Text>
            <Text style={styles.subtitle}>Orden #{orderId.slice(-8)}</Text>
          </View>

          {/* Rating Stars */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>¿Cómo fue tu experiencia?</Text>
            {renderStars()}
            <Text style={styles.ratingText}>{getRatingText()}</Text>
          </View>

          {/* Feedback Text */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackLabel}>
              Comentarios adicionales (opcional)
            </Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Comparte tu experiencia, sugerencias o comentarios..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.charCounter}>
              {feedback.length}/500 caracteres
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || rating === 0}
              activeOpacity={0.8}
            >
              {submitting ? (
                <Text style={styles.submitButtonText}>Enviando...</Text>
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={18} color="#fff" />
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
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerIconContainer: {
    backgroundColor: `${colors.belandOrange}20`,
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 14,
    color: colors.belandOrange,
    fontWeight: "500",
  },
  feedbackSection: {
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: "top",
    minHeight: 80,
  },
  charCounter: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.belandOrange,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
