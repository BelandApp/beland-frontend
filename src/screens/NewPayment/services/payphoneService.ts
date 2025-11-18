import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { User } from "src/context";
export const isWeb = Platform.OS === "web";

type PayphoneResponse = { payUrl: string };
function loadPayphoneScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!document.getElementById("payphone-css")) {
      const link = document.createElement("link");
      link.id = "payphone-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
      document.head.appendChild(link);
    }
    // @ts-ignore
    if (window.PPaymentButtonBox) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar el script de Payphone."));
    document.body.appendChild(script);
  });
}
export const payWithPayphone = async (
  amount: number,
  productId: string,
  user: User,
): Promise<void> => {
  if (isWeb) {
    await loadPayphoneScript();
    const payphoneToken = process.env.EXPO_PUBLIC_PAYPHONE_TOKEN;
    localStorage.setItem("payphone_token", payphoneToken);
    const payphoneConfig = {
      token: payphoneToken,
      clientTransactionId: `TX-${Date.now()}`,
      amount: Math.round(amount * 100), //TODO Asegurar que sea un entero
      amountWithoutTax: Math.round(amount * 100), //TODO Asegurar que sea un entero
      currency: "USD",
      storeId: process.env.EXPO_PUBLIC_PAYPHONE_STOREID,
      reference: `Pago de ${user.full_name} por productoId: ${productId}`,
      callback: `${window.location.origin}/wallet/payphone-success`,
    };
    // @ts-ignore
    new window.PPaymentButtonBox(payphoneConfig).render("pp-button");
  }

  // TODO 📱 Native: pedir URL de pago al backend
  if(!isWeb){
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/payphone/start`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, productId }),
    }
  );

  if (!response.ok) throw new Error("Error iniciando pago con Payphone");
  const { payUrl } = (await response.json()) as PayphoneResponse;

  await WebBrowser.openBrowserAsync(payUrl);}
};
