import React, { useRef } from "react";
import { Pressable, Platform, UIManager, findNodeHandle } from "react-native";
import { useTooltip } from "./Tooltip.portal";

interface Props {
  text: string;
  duration?: number;
  children: React.ReactNode;
  direction?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<Props> = ({
  text,
  children,
  direction = "top",
  duration = 2000,
}) => {
  const ref = useRef<any>(null);
  const { tooltip, setTooltip } = useTooltip();

  const isTouchDevice =
    Platform.OS !== "web" ||
    (typeof window !== "undefined" && "ontouchstart" in window);

  const show = () => {
    if (!ref.current) return;

    // 🔁 toggle
    if (tooltip?.text === text) {
      setTooltip(null);
      return;
    }

    if (Platform.OS === "web") {
      const rect = ref.current.getBoundingClientRect();

      setTooltip({
        anchorX: rect.left,
        anchorY: rect.top,
        anchorWidth: rect.width,
        anchorHeight: rect.height,
        text,
        direction,
        visible: true,
      });

      if (isTouchDevice && duration) {
        setTimeout(() => setTooltip(null), duration);
      }

      return;
    }

    const node = findNodeHandle(ref.current);
    if (!node) return;

    UIManager.measureInWindow(node, (x, y, width, height) => {
      setTooltip({
        anchorX: x,
        anchorY: y,
        anchorWidth: width,
        anchorHeight: height,
        text,
        direction,
        visible: true,
      });

      if (duration) {
        setTimeout(() => setTooltip(null), duration);
      }
    });
  };

  const hide = () => {
    if (!isTouchDevice) {
      setTooltip(null);
    }
  };

  return (
    <Pressable
      ref={ref}
      onPress={isTouchDevice ? show : undefined}
      onHoverIn={isTouchDevice ? show : undefined}
      onHoverOut={isTouchDevice ? hide : undefined}
    >
      {children}
    </Pressable>
  );
};
