import React from "react";
import { View, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

export const LoginWave: React.FC = () => {
  const { width, height } = Dimensions.get("window");
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: height,
        overflow: "hidden",
        zIndex: -1,
        backgroundColor: "#fff",
      }}
    >
      {/* Capa celeste */}
      <Svg
        width={width}
        height={height * 1.4}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ position: "absolute", bottom: 0 }}
      >
        <Path
          fill="#C6F5FF"
          d="M0,96L48,112C96,128,192,160,288,170.7C384,181,480,171,576,160C672,149,768,139,864,133.3C960,128,1056,128,1152,138.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L0,320Z"
        />
      </Svg>

      {/* Capa verde */}
      <Svg
        width={width}
        height={height * 1.2}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ position: "absolute", bottom: 0 }}
      >
        <Path
          fill="#7DA244"
          d="M0,160L48,165.3C96,171,192,181,288,181.3C384,181,480,171,576,170.7C672,171,768,181,864,170.7C960,160,1056,128,1152,112C1248,96,1344,96,1392,96L1440,96L1440,320L0,320Z"
        />
      </Svg>

      {/* Capa naranja curva superior */}
      <Svg
        width={width}
        height={height * 0.8}
        viewBox="0 0 1200 320"
        preserveAspectRatio="none"
        style={{ position: "absolute", bottom: 0 }}
      >
        <Path
          fill="#F88D2A"
          d="M 0 109 C 1263.931 -35.174 890.206 195.855 1440 129.604 L 1440 320 L 0 320 Z"
        />
      </Svg>
    </View>
  );
};
