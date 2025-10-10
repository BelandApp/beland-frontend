import React from "react";
import { View, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

export const HomeWave: React.FC = () => {
  const { width, height } = Dimensions.get("window");
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        zIndex: -1,
        backgroundColor: "#fff",
      }}
    >
      {/* Capa verde */}
      <Svg
        width={width*4}
        height={height}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: height / 5,
          left: width/4,
          overflow: "hidden",
        }}
      >
        <Path
          fill="#A9D195"
          d="M 16.79 70.975 C 78.275 -25.727 125.904 65.49 191.142 51.923 C 258.688 32.872 237.616 74.727 256.379 88.583 C 283.802 109.944 218.564 146.604 187.389 150.645 C 144.667 155.841 80.873 135.057 54.316 125.531 C 22.275 110.521 3.8 89.449 17.079 70.686"
        />
      </Svg>
      {/* Capa verde */}
      <Svg
        width={width*4}
        height={height}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: height,
          left: 0,
          overflow: "hidden",
        }}
      >
        <Path
          fill="#A9D195"
          d="M 16.79 70.975 C 78.275 -25.727 125.904 65.49 191.142 51.923 C 258.688 32.872 237.616 74.727 256.379 88.583 C 283.802 109.944 218.564 146.604 187.389 150.645 C 144.667 155.841 80.873 135.057 54.316 125.531 C 22.275 110.521 3.8 89.449 17.079 70.686"
        />
      </Svg>
    </View>
  );
};
