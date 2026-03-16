import { View, Text } from "react-native";
import React from "react";
import {
  BeCoinIcon,
  Button,
  Card,
  CustomLoader,
  ThemedHeader,
} from "src/components";
import { useCustomNavigation } from "src/hooks";
import { useTransferReceive } from "./hooks/useTransferReceive";
import { RouteProp, useRoute, useRoutePath } from "@react-navigation/native";
import { convertBeCoinsToUSD } from "src/constants";
import { DateToParagraphAndHour } from "src/utils/dateTransform";
type TransferType = { transferId: string };
export const TransferReceive = () => {
  const route = useRoute<RouteProp<{ params: TransferType }, "params">>();
  const { navigate } = useCustomNavigation();
  const { transfer, loading } = useTransferReceive(route.params.transferId);
  if (!transfer || loading) return <CustomLoader />;
  return (
    <React.Fragment>
      <ThemedHeader
        title="Transferencia recibida"
        canGoBack
        onBackPress={() => navigate("MainTabs", { screen: "Home" })}
      />
      <Card>
        <View className="flex-row gap-1 items-baseline mx-auto">
          <Text className="text-xl font-bold italic ">Diego</Text>
          <Text className="text-lg font-semibold"> te transfirió:</Text>
        </View>
        <Text className="text-slate-900 font-semibold text-center text-2xl my-4">
          USD$ {convertBeCoinsToUSD(transfer.amount_becoin)}
        </Text>
        <View className="flex-row gap-1 items-center mx-auto">
          <Text>Equivale a {transfer.amount_becoin}</Text>
          <BeCoinIcon />
        </View>
        <Text className="text-center my-2">Description</Text>
        <Text className="text-slate-400 text-center">
          {DateToParagraphAndHour(transfer.created_at)}
        </Text>
        <View className="w-full h-0.5 bg-slate-200 my-2" />
        <Button
          title="Usar mis Becoins"
          onPress={() => navigate("MainTabs", { screen: "Catalog" })}
          className="mx-auto"
        />
      </Card>
    </React.Fragment>
  );
};

export default TransferReceive;
