import React, { createContext, useContext, useState } from "react";
import { View, StyleSheet, Text } from "react-native";

type TooltipData = {
  x: number;
  y: number;
  text: string;
  visible: boolean;
};

const TooltipContext = createContext<any>(null);

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  return (
    <TooltipContext.Provider value={{ tooltip, setTooltip }}>
      {children}

      {tooltip?.visible && (
        <View
          pointerEvents="none"
          style={[styles.tooltip, { top: tooltip.y, left: tooltip.x }]}
        >
          <Text style={styles.text}>{tooltip.text}</Text>
        </View>
      )}
    </TooltipContext.Provider>
  );
};

export const useTooltip = () => useContext(TooltipContext);

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: 6,
    maxWidth: 260,
    zIndex: 99999,
    elevation: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  text: {
    color: "#000000",
  },
});
