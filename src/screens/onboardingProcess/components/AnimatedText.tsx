import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, StyleSheet, Text, TextStyle } from "react-native";

interface AnimatedTextProps {
  children: React.ReactNode;

  style?: StyleProp<TextStyle>;

  delay?: number;
}

const AnimatedText = ({ children, style, delay = 0 }: AnimatedTextProps) => {
  const opacity = useRef(new Animated.Value(0)).current;

  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.Text
      style={[
        styles.text,
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.Text>
  );
};

export default React.memo(AnimatedText);

const styles = StyleSheet.create({
  text: {
    color: "#000",
  },
});
