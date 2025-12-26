const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Configuración para resolver problemas de compatibilidad
config.resolver.platforms = ["ios", "android", "native", "web"];

config.resolver.alias = {
  // Resuelve problemas comunes de React Native en web
  "react-native$": "react-native-web",
};

module.exports = withNativeWind(config, { input: "./global.css" });
