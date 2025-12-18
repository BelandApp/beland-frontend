// ! VER SI SE USA

import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { modalStyles } from "../styles";

interface DeliveryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPickup: () => void;
  onSelectDelivery: () => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  visible,
  onClose,
  onSelectPickup,
  onSelectDelivery,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>
              ¿Cómo quieres recibir tu producto?
            </Text>
            <Text style={modalStyles.modalSubtitle}>
              Elige la opción que más te convenga
            </Text>
          </View>

          <View style={modalStyles.modalOptions}>
            {/* Opción de Envío a domicilio primero */}
            <TouchableOpacity
              style={modalStyles.optionButton}
              onPress={onSelectDelivery}
            >
              <View style={modalStyles.optionIcon}>
                <Text style={modalStyles.optionIconText}>🚚</Text>
              </View>
              <View style={modalStyles.optionTextContainer}>
                <Text style={modalStyles.optionTitle}>Envío a domicilio</Text>
                <Text style={modalStyles.optionDescription}>
                  Recibe tu producto en la comodidad de tu hogar
                </Text>
              </View>
            </TouchableOpacity>

            {/* Opción de Juntada Circular con explicación y su icono */}
            <TouchableOpacity
              style={modalStyles.optionButton}
              onPress={onSelectPickup}
            >
              <View style={modalStyles.optionIcon}>
                <Text style={modalStyles.optionIconText}>👥</Text>
              </View>
              <View style={modalStyles.optionTextContainer}>
                <Text style={modalStyles.optionTitle}>Juntada Circular</Text>
                <Text style={modalStyles.optionDescription}>
                  Compra en grupo y accede a mejores precios y beneficios. Solo
                  pagas lo que consumes. ¡Ideal para compartir con amigos o
                  vecinos!
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
