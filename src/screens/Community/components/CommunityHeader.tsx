import React from "react";
import { View, Text } from "react-native";
import { headerStyles } from "../styles";

import {} from "../../../constants/currency";
import { BeCoinsBalance } from "../../../components/ui/BeCoinsBalance";

interface CommunityHeaderProps {
  balance: number;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  balance,
}) => {
  return (
    <View style={headerStyles.titleContainer}>
      <View style={headerStyles.headerContent}>
        <View style={headerStyles.titleSection}>
          <Text style={headerStyles.sectionTitle}>Comunidad</Text>
          <Text style={headerStyles.sectionSlogan}>
            "Ser parte del cambio tiene sus privilegios"
          </Text>
        </View>
        <View style={headerStyles.balanceContainer}>
          <BeCoinsBalance variant="header" size="medium" balance={balance} />
        </View>
      </View>
    </View>
  );
};
