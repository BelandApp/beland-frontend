import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  Text,
  View,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { colors } from "src/styles";
import { InputStyles, variantStyles } from "./InputStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface PhoneInputProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
  onBlur?: () => void;
  variant?: "underline" | "filled";
  icon?: boolean;
  textColor?: string;
  placeholderTextColor?: string;
}

const COUNTRY_CODES = [
  { code: "+593", name: "ECU" },
  { code: "+54", name: "ARG" },
  { code: "+34", name: "ESP" },
  { code: "+52", name: "MEX" },
  { code: "+57", name: "COL" },
  { code: "+1", name: "EEUU" },
];
const parsePhoneValue = (value: string) => {
  if (!value.startsWith("+")) return { code: "+54", number: value };
  const sortedCodes = [...COUNTRY_CODES].sort(
    (a, b) => b.code.length - a.code.length
  );
  for (const entry of sortedCodes) {
    if (value.startsWith(entry.code)) {
      return {
        code: entry.code,
        number: value.replace(entry.code, "").replace(/\D/g, ""),
      };
    }
  }
  // fallback en caso de no reconocer el código
  return { code: "+54", number: value.replace(/\D/g, "") };
};
export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  onBlur,
  variant = "underline",
  icon = false,
  textColor,
  placeholderTextColor,
  ...props
}) => {
  const selectedVariant = variantStyles[variant];
  const initial = parsePhoneValue(value);
  const [countryCode, setCountryCode] = useState(initial.code);
  const [number, setNumber] = useState(initial.number);
  const [isFocused, setIsFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;
  const animatedBorder = useRef(new Animated.Value(0)).current;

  // Animaciones del label y borde
  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  useEffect(() => {
    Animated.timing(animatedBorder, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const labelStyle = {
    position: "absolute" as const,
    left: 90,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [10, -10],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [17, 13],
    }),
    color: "#ffffffaa",
  };

  const borderColor = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", "#FFD700"],
  });

  const handleChange = (text: string) => {
    const clean = text.replace(/\D/g, "");
    setNumber(clean);
    onChange(`${countryCode}${text}`);
  };

  const handleSelectCountry = (code: string) => {
    setCountryCode(code);
    onChange(`${code}${number}`);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        tabIndex={-1}
        accessible={false}
        onPress={() => setIsFocused(true)}
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Animated.View
          accessible={false}
          tabIndex={-1}
          style={[
            InputStyles.baseContainer,
            selectedVariant.container,
            variant === "underline" && { borderBottomColor: borderColor },
          ]}
        >
          <Animated.Text style={[labelStyle, selectedVariant.label]}>
            Teléfono
          </Animated.Text>

          <View style={styles.row} accessible={false} tabIndex={-1}>
            {/* CUSTOM COUNTRY PICKER */}
            <TouchableOpacity
              style={styles.countryButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[styles.countryText, selectedVariant.label]}>
                {COUNTRY_CODES.find((c) => c.code === countryCode)?.name}{" "}
                {countryCode}
              </Text>
            </TouchableOpacity>

            <TextInput
              keyboardType="phone-pad"
              value={number}
              onChangeText={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                onBlur && onBlur();
              }}
              style={[
                InputStyles.baseInput,
                selectedVariant.input,
                textColor ? { color: textColor } : {},
              ]}
              placeholderTextColor={
                placeholderTextColor ||
                (selectedVariant.input as any).color ||
                "#000"
              }
              {...props}
            />
            {icon && (
              <MaterialCommunityIcons
                name="phone-outline"
                size={20}
                color="#666"
                style={styles.icon}
              />
            )}
          </View>
        </Animated.View>
        <View style={InputStyles.errorContainer}>
          {error && <Text style={InputStyles.textError}>{error}</Text>}
        </View>
      </Pressable>

      {/* MODAL */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecciona tu país</Text>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectCountry(item.code)}
                >
                  <Text style={styles.modalItemText}>
                    {item.name} {item.code}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
  },
  icon: {
    margin: 12,
  },
  container: {
    position: "relative",
    borderBottomWidth: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  countryButton: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginRight: 8,
  },
  countryText: {
    fontSize: 16,
    color: "white",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: colors.belandOrange,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomColor: "#fff2",
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
});

export default PhoneInput;
