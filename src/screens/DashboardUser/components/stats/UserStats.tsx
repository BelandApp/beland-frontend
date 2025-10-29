import React from "react";
import { View, Text } from "react-native";

interface Props {
  beCoinsBalance: number;
  currentLevel: number;
  styles: any;
}

const UserStats: React.FC<Props> = ({
  beCoinsBalance,
  currentLevel,
  styles,
}) => (
  <View style={styles.statsContainer}>
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{beCoinsBalance}</Text>
      <Text style={styles.statLabel}>BeCoins</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{currentLevel}</Text>
      <Text style={styles.statLabel}>Nivel</Text>
    </View>
  </View>
);

export default UserStats;
