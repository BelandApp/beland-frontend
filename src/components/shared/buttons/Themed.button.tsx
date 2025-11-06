import { JSX } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { colors } from "src/styles";
type ThemedButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: JSX.Element;
  iconPosition?: IconPosition;
  disabled?: boolean;
  isLoading?: boolean;
  style?: any;
  textStyle?: any;
};
type Variant = "primary" | "secondary" | "ghost";
type IconPosition = "left" | "right";
const ThemedButton: React.FC<ThemedButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  icon,
  iconPosition = "left",
  disabled = false,
  isLoading = false,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.belandOrange,
          textColor: disabled ? "#f2e9e9c5" : "white",
        };
      case "secondary":
        return {
          backgroundColor: colors.belandGreen,
          textColor: disabled ? "#f2e9e9c5" : "white",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          textColor: colors.belandOrange,
          borderWidth: 1,
          borderColor: colors.belandOrange,
        };
      default:
        return { backgroundColor: colors.belandOrange, textColor: "white" };
    }
  };
  const variantStyles = getVariantStyles();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: variantStyles.backgroundColor },
        variant === "ghost" && {
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
        },
        { cursor: disabled ? "not-allowed" : "pointer" },
        style,
      ]}
      disabled={disabled || isLoading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: isLoading }}
      accessibilityHint={
        disabled
          ? "Este botón está deshabilitado"
          : isLoading
          ? "Acción en curso"
          : undefined
      }
      activeOpacity={0.8}
    >
      {icon && iconPosition === "left" && icon}
      {isLoading ? (
        <ActivityIndicator color={variantStyles.textColor} />
      ) : (
        <Text
          style={[styles.text, { color: variantStyles.textColor }, textStyle]}
        >
          {label}
        </Text>
      )}
      {icon && iconPosition === "right" && icon}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
export default ThemedButton;
