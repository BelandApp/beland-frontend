import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

export interface TooltipStep {
  id: string;
  title: string;
  description: string;
  position: "bottom" | "top";
  tabIndex: number; // 0-4 for the 5 tabs
}

// Define the onboarding steps for navbar items
export const NAVBAR_TOUR_STEPS: TooltipStep[] = [
  {
    id: "home",
    title: "🏠 Inicio",
    description: "Tu balance de BeCoins, estadísticas y transacciones",
    position: "top",
    tabIndex: 0,
  },

  {
    id: "wallet",
    title: "💰 Billetera",
    description: "Gestiona tu saldo y realiza transacciones",
    position: "top",
    tabIndex: 1,
  },
  {
    id: "catalog",
    title: "🛒 Catálogo",
    description: "Explora y compra productos con tus BeCoins",
    position: "top",
    tabIndex: 2,
  },
  {
    id: "events",
    title: "🎟️ Eventos",
    description: "Adquiere tickets para eventos especiales",
    position: "top",
    tabIndex: 3,
  },
  {
    id: "groups",
    title: "👥 Grupos",
    description: "Organiza compras conjuntas con amigos",
    position: "top",
    tabIndex: 4,
  },
];

interface OnboardingOverlayProps {
  visible: boolean;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  visible,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const step = NAVBAR_TOUR_STEPS[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, currentStep]);

  if (!visible || !step) return null;

  const { width, height } = Dimensions.get("window");
  const tabWidth = width / 5; // 5 tabs
  const tabBarHeight = Platform.OS === "ios" ? 80 : 60;

  // Calculate tooltip position based on tab index
  const tooltipLeft = step.tabIndex * tabWidth + tabWidth / 2 - 140; // 140 is half of tooltip width (280)
  const tooltipBottom = tabBarHeight + 20; // 20px above the tab bar

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
      pointerEvents="box-none"
    >
      {/* Dark background with hole for the active tab */}
      <View style={styles.darkOverlay} pointerEvents="none">
        {/* Highlight circle for active tab */}
        <View
          style={[
            styles.highlight,
            {
              left: step.tabIndex * tabWidth,
              width: tabWidth,
              bottom: 0,
              height: tabBarHeight,
            },
          ]}
        />
      </View>

      {/* Tooltip */}
      <View
        style={[
          styles.tooltipContainer,
          {
            left: Math.max(10, Math.min(tooltipLeft, width - 290)),
            bottom: tooltipBottom,
          },
        ]}
      >
        {/* Arrow pointing down to tab */}
        <View style={styles.arrowDown} />

        <View style={styles.tooltip}>
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipTitle}>{step.title}</Text>
            <TouchableOpacity onPress={onSkip} style={styles.closeButton}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.tooltipDescription}>{step.description}</Text>

          {/* Progress dots */}
          <View style={styles.progressContainer}>
            {NAVBAR_TOUR_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Navigation buttons */}
          <View style={styles.buttonsContainer}>
            {!isFirstStep && (
              <TouchableOpacity
                onPress={onPrevious}
                style={styles.secondaryButton}
              >
                <Feather name="chevron-left" size={16} color="#666" />
                <Text style={styles.secondaryButtonText}>Anterior</Text>
              </TouchableOpacity>
            )}

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              onPress={isLastStep ? onComplete : onNext}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {isLastStep ? "¡Listo!" : "Siguiente"}
              </Text>
              {!isLastStep && (
                <Feather name="chevron-right" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  highlight: {
    position: "absolute",
    backgroundColor: "transparent",
    borderWidth: 3,
    borderColor: "#00E074",
    borderRadius: 12,
  },
  tooltipContainer: {
    position: "absolute",
    width: 280,
    zIndex: 10000,
  },
  arrowDown: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#fff",
    alignSelf: "center",
    marginBottom: -1,
  },
  tooltip: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  tooltipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  tooltipDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  progressDotActive: {
    backgroundColor: "#00E074",
    width: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    gap: 4,
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#00E074",
    gap: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
