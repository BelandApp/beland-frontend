import React from "react";
import { StyleSheet, View } from "react-native";

interface ProgressDotsProps {
  total: number;
  current: number;
}

export const ProgressDots = ({ total, current }: ProgressDotsProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === current && styles.activeDot]}
        />
      ))}
    </View>
  );
};

export default React.memo(ProgressDots);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#D6D6D6",
  },

  activeDot: {
    width: 24,
    backgroundColor: "#000",
  },
});
