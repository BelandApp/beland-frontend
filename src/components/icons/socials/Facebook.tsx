import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

export const FacebookIcon = ({ width = 24, height = 24 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 128 128">
      <Rect
        width={118.35}
        height={118.35}
        x={4.83}
        y={4.83}
        fill="#3d5a98"
        rx={6.53}
        ry={6.53}
      ></Rect>
      <Path
        fill="#fff"
        d="M86.48 123.17V77.34h15.38l2.3-17.86H86.48v-11.4c0-5.17 1.44-8.7 8.85-8.7h9.46v-16A127 127 0 0 0 91 22.7c-13.62 0-23 8.3-23 23.61v13.17H52.62v17.86H68v45.83z"
      ></Path>
    </Svg>
  );
};
