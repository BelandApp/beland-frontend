import { View, Text, Image } from "react-native";
import React, { useEffect } from "react";
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
import { PhoneCall } from "lucide-react-native";
import { DIEGO_NUMBER, shareTextOnWhatsApp } from "src/utils/shareHelper";
import { useAuth } from "src/context";
import { notify } from "src/hooks/notification/notify.external";
import { DeepLinkService } from "src/services/deepLink/deepLink.service";
type TransferType = { id: string };
export const TransferReceive = () => {
  const route = useRoute<RouteProp<{ params: TransferType }, "params">>();
  const id = route.params.id;
  const { navigate } = useCustomNavigation();
  const { isAuthenticated, status } = useAuth();
  const { transfer, loading, error } = useTransferReceive(id);
  console.log(status, isAuthenticated);
  useEffect(() => {
    if (!isAuthenticated && status === "unauthenticated") {
      notify.confirm({
        message: "Debes estar logueado para visualizar transferencias",
        onConfirm: async () => {
          await DeepLinkService.setIntent({ screen: "TransferReceive", id });
          navigate("Login");
        },
        onCancel: () => navigate("MainTabs", { screen: "Home" }),
      });
    }
  }, [status]);
  if (status === "unauthenticated" || error === "401")
    return (
      <React.Fragment>
        <ThemedHeader
          title="Transferencia recibida"
          canGoBack
          onBackPress={() => navigate("MainTabs", { screen: "Home" })}
        />
        <View className="m-auto gap-6 w-fit ">
          <Text className="text-xl font-semibold text-center">
            Logueate para ver el contenido!
          </Text>
          <Button
            title="Loguearte"
            onPress={() => {
              navigate("Login");
            }}
            className="w-fit mx-auto"
          />
        </View>
      </React.Fragment>
    );
  if (error === "NotUII" || error === "other")
    return (
      <React.Fragment>
        <ThemedHeader
          title="Transferencia recibida"
          canGoBack
          onBackPress={() => navigate("MainTabs", { screen: "Home" })}
        />
        <View className="m-auto gap-6 w-fit ">
          <Text className="text-xl font-semibold text-center">
            No pudimos encontrar esta transferencia, revisa que el link sea
            correcto o comunicate con Beland
          </Text>
          <Button
            title="WhatsApp"
            icon={<PhoneCall color={"white"} />}
            onPress={() => {
              shareTextOnWhatsApp({
                message: `Estoy teniendo problemas con la transferencia de ID: ${route.params.id}, podrían verificarla?`,
                phone: DIEGO_NUMBER,
              });
            }}
            className="w-fit mx-auto"
          />
        </View>
      </React.Fragment>
    );
  if (!transfer || loading || status === "checking") return <CustomLoader />;
  return (
    <React.Fragment>
      <ThemedHeader
        title="Transferencia recibida"
        canGoBack
        onBackPress={() => navigate("MainTabs", { screen: "Home" })}
      />
      <Card>
        <View className="flex-row gap-1 items-center mx-auto">
          <Image
            source={{ uri: transfer.related_wallet.user?.profile_picture_url }}
            style={{ width: 20, height: 20, borderRadius: 50 }}
          />
          <Text className="text-xl font-bold italic ">
            {transfer.related_wallet.user?.full_name}
          </Text>
          <Text className="text-lg font-semibold"> te transfirió:</Text>
        </View>
        <Text className="text-slate-900 font-semibold text-center text-2xl my-4">
          USD$ {convertBeCoinsToUSD(transfer.amount_becoin)}
        </Text>
        <View className="flex-row gap-1 items-center mx-auto">
          <Text>Equivale a {transfer.amount_becoin}</Text>
          <BeCoinIcon />
        </View>
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
