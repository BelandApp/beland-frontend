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
  children,
  direction = "top",
  duration = 2000,
}) => {
  const ref = useRef<any>(null);
  const { setTooltip } = useTooltip();

  const show = () => {
    if (!ref.current) return;

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

      setTimeout(() => setTooltip(null), duration);
    });
  };

  const hide = () => Platform.OS === "web" && setTooltip(null);

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
