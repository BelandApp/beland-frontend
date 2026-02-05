import { JSX } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
  ButtonProps,
  PressableProps,
} from "react-native";
import { colors } from "src/styles";

interface CustomButtonProps extends PressableProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: JSX.Element;
  iconPosition?: IconPosition;
  disabled?: boolean;
  isLoading?: boolean;
  style?: any;
  textStyle?: any;
  className?: string;
}
type Variant = "primary" | "secondary" | "ghost" | "inline" | "onlyIcon";
type IconPosition = "left" | "right";

const VARIANT_STYLES = {
  primary: {
    container: { backgroundColor: colors.belandOrange },
    text: { color: "white" },
  },
  secondary: {
    container: { backgroundColor: colors.belandGreen },
    text: { color: "white" },
  },
  ghost: {
    container: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.belandOrange,
    },
    text: { color: colors.belandOrange },
  },
  inline: {
    container: {
      backgroundColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: colors.belandOrange,
      paddingVertical: 0,
      paddingHorizontal: 0,
      borderRadius: 0,
    },
    text: { color: colors.belandOrange },
  },
  onlyIcon: {
    container: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: colors.belandOrange,
      paddingVertical: 6,
      paddingHorizontal: 6,
    },
    text: { color: "transparent" },
  },
} as const;
const getVariantStyles = (variant: Variant, disabled?: boolean) => {
  const base = VARIANT_STYLES[variant];
  if (disabled) {
    return {
      container: { ...base.container, opacity: 0.6 },
      text: { ...base.text, color: "#ccc" },
    };
  }
  return base;
};
export const Button: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  icon,
  iconPosition = "left",
  disabled = false,
  isLoading = false,
  style,
  className,
  textStyle,
}) => {
  const variantStyle = getVariantStyles(variant, disabled);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        variantStyle.container,
        (disabled || isLoading) && { opacity: 0.6 },
        style,
      ]}
      className={className}
      disabled={disabled || isLoading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
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
        <ActivityIndicator color={variantStyle.text.color} />
      ) : (
        variant !== "onlyIcon" && (
          <Text style={[styles.text, variantStyle.text, textStyle]}>
            {title}
          </Text>
        )
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
export default Button;
