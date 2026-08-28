import React from "react";
import { StyleSheet, Text, TextStyle, View } from "react-native";

import AnimatedText from "./AnimatedText";

interface StepProps {
  title: string;

  subtitle?: string;

  children?: React.ReactNode;

  align?: "top" | "center";

  titleStyle?: TextStyle;

  subtitleStyle?: TextStyle;
}

const Step = ({
  title,
  subtitle,
  children,
  align = "center",
  titleStyle,
  subtitleStyle,
}: StepProps) => {
  return (
    <View style={[styles.container, align === "center" && styles.center]}>
      <View style={styles.header}>
        <AnimatedText style={[styles.title, titleStyle]}>{title}</AnimatedText>

        {!!subtitle && (
          <AnimatedText delay={150} style={[styles.subtitle, subtitleStyle]}>
            {subtitle}
          </AnimatedText>
        )}
      </View>

      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
};

export default React.memo(Step);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    justifyContent: "center",
  },

  header: {
    gap: 12,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 17,
    color: "#6B7280",
    lineHeight: 25,
    textAlign: "center",
  },

  content: {
    marginTop: 40,
    alignItems: "center",
  },
});
