import React from "react";
import Svg, { Circle, Text } from "react-native-svg";

interface BeCoinIconProps {
  width?: number;
  height?: number;
  color?: BecoinColorName;
}

export type BecoinColorName = keyof typeof BecoinColors;
export type BecoinColorTuple = (typeof BecoinColors)[BecoinColorName];

export const BecoinColors = {
  orange: ["#FFA500", "#F0B74F", "#FF7F50"],
  green: ["#00FF00", "#32CD32", "#228B22"],
  yellow: ["#FAB400", "#F7CC00", "#D89005"],
} as const;

export const BeCoinIcon: React.FC<BeCoinIconProps> = ({
  width = 24,
  height = 24,
  color = "yellow",
}) => {
  const [outer, middle, text] = BecoinColors[color];
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="12" fill={outer} />
      <Circle cx="12" cy="12" r="10" fill={middle} />
      <Text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill={text}
      >
        BC
      </Text>
    </Svg>
  );
};
