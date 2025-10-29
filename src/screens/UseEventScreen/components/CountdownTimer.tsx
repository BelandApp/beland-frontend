import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { colors } from "src/styles";

interface Props {
  eventDate: Date;
}

export const CountdownTimer: React.FC<Props> = ({ eventDate }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("¡Ya comenzó el evento!");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      if (days > 0) {
        setTimeLeft(`Faltan ${days} día${days > 1 ? "s" : ""}`);
      } else {
        setTimeLeft(`Faltan ${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{timeLeft}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: "500",
  },
});
