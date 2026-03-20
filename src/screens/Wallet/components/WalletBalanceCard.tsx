import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { Card } from "../../../components/ui/Card";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { WalletData } from "../types";
import { walletCardStyles } from "../styles";
import { colors } from "src/design-system";
import { convertBeCoinsToUSD } from "src/constants";
import { Info } from "lucide-react-native";
import { Tooltip } from "src/components";

interface WalletBalanceCardProps {
  walletData: WalletData;
  backgroundColor?: string;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  walletData,
  backgroundColor,
}) => {
  const [hideEstimated, setHideEstimated] = useState(false);
  const [totalOtherCoins, setTotalOthersCoins] = useState(
    Number(walletData.becoin_green) + Number(walletData.becoin_orange),
  );

  return (
    <Card
      style={{
        ...walletCardStyles.walletCard,
        ...(backgroundColor ? { backgroundColor } : {}),
      }}
    >
      <View style={walletCardStyles.walletContent}>
        <View style={walletCardStyles.walletLeft}>
          <Text style={walletCardStyles.availableLabel}>Disponible:</Text>
          <Text style={[walletCardStyles.balanceAmount]}>
            USD$ {walletData.estimatedValue}
          </Text>
          <View className="w-full h-0.5 bg-slate-200  rounded-md my-1" />
          <View className="gap-2 my-2 ">
            <View className="md:flex-row gap-2 md:items-center">
              <View className="flex-row gap-2 items-center md:justify-between">
                {!hideEstimated && (
                  <Text style={walletCardStyles.estimatedValue}>
                    {isNaN(walletData.balance)
                      ? "0"
                      : Math.floor(walletData.balance)}
                  </Text>
                )}
                <BeCoinIcon width={24} height={24} />
              </View>
              <Text className="text-gray-500">
                <Text className="font-semibold text-gray-600">
                  Becoins Amarillas:{" "}
                </Text>
                úsalas para comprar dentro del ecosistema Beland.
              </Text>
            </View>
            <View>
              <Text style={walletCardStyles.availableLabel}>
                Disponible para canje:
              </Text>
              <Text className="text-lg font-semibold text-[#1F2937]">
                USD$ {convertBeCoinsToUSD(totalOtherCoins)}
              </Text>
            </View>
            <View className="md:flex-row gap-2 md:items-center">
              <View className="flex-row gap-2 items-center md:justify-between ">
                {!hideEstimated && (
                  <Text style={walletCardStyles.estimatedValue}>
                    {isNaN(walletData.becoin_green)
                      ? "0"
                      : Math.floor(walletData.becoin_green)}{" "}
                  </Text>
                )}
                <BeCoinIcon width={24} height={24} color={"green"} />
                <Text>
                  (Usd$ {convertBeCoinsToUSD(walletData.becoin_green)})
                </Text>

                <Text className="font-semibold text-gray-600">
                  Becoins Verdes
                </Text>
                <Tooltip
                  text="Úsala para comprar dentro de la app, o canjéalas por Becoins
                amarillas."
                  direction="top"
                >
                  <Info color={"orange"} />
                </Tooltip>
              </View>
            </View>
            <View className="md:flex-row gap-2 md:items-center">
              <View className="flex-row gap-2 items-center md:justify-between">
                {!hideEstimated && (
                  <Text style={walletCardStyles.estimatedValue}>
                    {isNaN(walletData.becoin_orange)
                      ? "0"
                      : Math.floor(walletData.becoin_orange)}{" "}
                  </Text>
                )}
                <BeCoinIcon width={24} height={24} color={"orange"} />
                <Text>
                  (Usd$ {convertBeCoinsToUSD(walletData.becoin_orange)})
                </Text>
                <Text className="font-semibold text-gray-600">
                  Becoins Naranja
                </Text>
                <Tooltip
                  text="Úsala para comprar dentro de la app."
                  direction="top"
                >
                  <Info color={"orange"} />
                </Tooltip>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};
