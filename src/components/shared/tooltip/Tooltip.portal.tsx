import React, { createContext, useContext, useState } from "react";
import { View, StyleSheet, Text } from "react-native";

type TooltipData = {
  anchorX: number;
  anchorY: number;
  anchorWidth: number;
  anchorHeight: number;
  text: string;
  direction: "top" | "bottom" | "left" | "right";
  visible: boolean;
};

const TooltipContext = createContext<any>(null);

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  if (!tooltip?.visible)
    return (
      <TooltipContext.Provider value={{ tooltip, setTooltip }}>
        {children}
      </TooltipContext.Provider>
    );

  const MARGIN = 10;
  let left = 0;
  let top = 0;

  const { anchorX, anchorY, anchorWidth, anchorHeight, direction } = tooltip;

  switch (direction) {
    case "top":
      left = anchorX + anchorWidth / 2 - layout.width / 2;
      top = anchorY - layout.height - MARGIN;
      break;
    case "bottom":
      left = anchorX + anchorWidth / 2 - layout.width / 2;
      top = anchorY + anchorHeight + MARGIN;
      break;
    case "left":
      left = anchorX - layout.width - MARGIN;
      top = anchorY + anchorHeight / 2 - layout.height / 2;
      break;
    case "right":
      left = anchorX + anchorWidth + MARGIN;
      top = anchorY + anchorHeight / 2 - layout.height / 2;
      break;
  }

  return (
    <TooltipContext.Provider value={{ tooltip, setTooltip }}>
      {children}

      <View
        pointerEvents="none"
        style={[styles.tooltip, { position: "absolute", left, top }]}
        onLayout={(e) => setLayout(e.nativeEvent.layout)}
      >
        <Text style={styles.text}>{tooltip.text}</Text>
      </View>
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
