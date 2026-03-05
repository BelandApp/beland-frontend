import { View, Text } from "react-native";
import React from "react";
import ConstructionScreen from "../Construction/Construction.screen";
import { Construction } from "lucide-react-native";
import { colors } from "src/design-system";

const ConstructionGroups = () => {
  return (
    <ConstructionScreen
      title="Grupos"
      message={`Estamos construyendo Grupos y Comunidades para ti
         Pronto tendrás novedades!`}
      icon={<Construction size={85} color={colors.brand.orange[300]} />}
    />
  );
};

export default ConstructionGroups;
