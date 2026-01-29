import React, { useRef } from "react";
import { Pressable, Platform, UIManager, findNodeHandle } from "react-native";
import { useTooltip } from "./Tooltip.portal";

interface Props {
  text: string;
  duration?: number;
  children: React.ReactNode;
  direction: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<Props> = ({
  text,
  duration = 2000,
  children,
}) => {
  const ref = useRef<any>(null);
  const { setTooltip } = useTooltip();

  const show = () => {
    if (!ref.current) return;

    /** ---------------- WEB ---------------- */
    if (Platform.OS === "web") {
      const rect = ref.current.getBoundingClientRect();

      setTooltip({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
        text,
        visible: true,
      });
      return;
    }

    /** ---------------- NATIVE ---------------- */
    const node = findNodeHandle(ref.current);
    if (!node) return;

    UIManager.measureInWindow(node, (x, y, width, height) => {
      setTooltip({
        x: x + width / 2,
        y: y - 8,
        text,
        visible: true,
      });

      setTimeout(() => setTooltip(null), duration);
    });
  };

  const hide = () => {
    if (Platform.OS === "web") setTooltip(null);
  };

  return (
    <Pressable
      ref={ref}
      onPress={Platform.OS !== "web" ? show : undefined}
      onHoverIn={Platform.OS === "web" ? show : undefined}
      onHoverOut={Platform.OS === "web" ? hide : undefined}
    >
      {children}
    </Pressable>
  );
};
