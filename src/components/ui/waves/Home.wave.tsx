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
        // overflow: "hidden",
        zIndex: -1,
        backgroundColor: "#fff",
      }}
    >
      {/* Capa verde */}
      <Svg
        width={width * 5}
        height={height *2}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ position: "absolute", top: height / 2, left: width/4 }}
      >
        <Path
          fill="#A9D195"
          d="M 0 0 C 17.066 -69.62 88.899 -71.409 204.245 -60.832 C 342.761 -46.225 194.675 -46.728 332.183 -0.389 C 431.914 45.448 268.214 38.396 162.439 68.114 C 44.574 97.328 -10.29 39.804 -0.032 0.052"
        />
      </Svg>
    </View>
  );
};

