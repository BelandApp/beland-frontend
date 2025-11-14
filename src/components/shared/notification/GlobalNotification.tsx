import Toast, {
  BaseToast,
  BaseToastProps,
  ToastConfigParams,
} from "react-native-toast-message";
import { useEffect } from "react";
import { useNotificationStore } from "@/stores/notificationStore";
import { View, Text } from "react-native";
import { Brain, CheckCircle, CircleAlert, InfoIcon } from "lucide-react-native";
import { colors } from "src/styles";
import { Button } from "../buttons";
import { notificationAsync, NotificationFeedbackType } from "expo-haptics";

interface ConfirmProps extends BaseToastProps {
  onConfirm: () => void;
  onCancel?: () => void;
}

const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      renderLeadingIcon={() => (
        <CheckCircle style={{ paddingLeft: 2 }} color="green" />
      )}
      text1Style={{ color: "green" }}
      style={{ alignItems: "center" }}
    />
  ),
  error: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      renderLeadingIcon={() => (
        <CircleAlert style={{ paddingLeft: 2 }} color="red" />
      )}
      style={{ alignItems: "center", borderLeftColor: "red" }}
    />
  ),
  info: (props: BaseToastProps) => (
    <BaseToast
      renderLeadingIcon={() => (
        <InfoIcon style={{ paddingLeft: 2 }} color="#5584d0ff" />
      )}
      style={{ alignItems: "center", borderLeftColor: "#5584d0ff" }}
      {...props}
    />
  ),
  confirm: ({ text1, props }: ToastConfigParams<ConfirmProps>) => (
    <View
      style={{
        width: "70%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
        justifyContent: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Brain color={colors.belandOrange} />
        <Text
          style={{
            fontWeight: "600",
            fontSize: 16,
            textAlign: "center",
            margin: "auto",
          }}
        >
          {text1}
        </Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
        <Button
          title="Cancelar"
          variant="ghost"
          onPress={() => {
            Toast.hide();
            props?.onCancel?.();
          }}
        />

        <Button
          title="Confirmar"
          variant="primary"
          onPress={() => {
            Toast.hide();
            notificationAsync(NotificationFeedbackType.Success);
            props?.onConfirm?.();
          }}
        />
      </View>
    </View>
  ),
};

export const GlobalNotification = () => {
  const { current, clear } = useNotificationStore();

  useEffect(() => {
    if (!current) return;
    if(current.type === "confirm") notificationAsync(NotificationFeedbackType.Warning);
    Toast.show({
      type: current.type,
      text1: current.message,
      props: {
        onConfirm: current.type === "confirm" ? current.onConfirm : undefined,
        onCancel: current.type === "confirm" ? current.onCancel : undefined,
      },
      autoHide: current.type !== "confirm",
      visibilityTime: current.type !== "confirm" ? 3000 : undefined,
      position: "top",
    });

    clear();
  }, [current]);

  return <Toast config={toastConfig} />;
};
