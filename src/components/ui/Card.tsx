import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { theme } from "@design-system/tokens";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  style,
  titleStyle,
  elevated = true,
}) => {
  return (
    <View style={[styles.card, elevated && styles.elevated, style]}>
      {(title || subtitle || icon) && (
        <View style={styles.header}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <View style={styles.titleContainer}>
            {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.semanticSpacing.radius.xl,
    padding: theme.spacing[5],
    marginVertical: theme.spacing[2],
    marginHorizontal: theme.spacing[1],
  },
  elevated: {
    ...theme.semanticShadows.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
  icon: {
    fontSize: theme.typography.fontSize["2xl"],
    marginRight: theme.spacing[3],
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.textStyles.h5.fontSize,
    fontWeight: theme.textStyles.h5.fontWeight as TextStyle["fontWeight"],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1] / 2,
  },
  subtitle: {
    fontSize: theme.textStyles.caption.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: theme.textStyles.caption.fontWeight as TextStyle["fontWeight"],
  },
  content: {
    flex: 1,
  },
});
