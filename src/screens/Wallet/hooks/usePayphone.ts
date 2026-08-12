import { Platform } from "react-native";

export const destroyPayphoneWidget = () => {
  if (Platform.OS !== "web") return;

  try {
    const container = document.getElementById("pp-button");

    if (container) {
      container.innerHTML = "";
    }
  } catch (error) {
    console.error("Error limpiando Payphone:", error);
  }
};
export function loadPayphoneScript(): Promise<void> {
  if (Platform.OS !== "web") {
    return Promise.reject(new Error("Payphone solo está disponible en web"));
  }

  return new Promise((resolve, reject) => {
    // @ts-ignore
    if (typeof window === "undefined") {
      reject(new Error("Window no está definido"));
      return;
    }

    // Cargar CSS solo una vez
    // @ts-ignore
    if (!document.getElementById("payphone-css")) {
      // @ts-ignore
      const link = document.createElement("link");
      link.id = "payphone-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
      // @ts-ignore
      document.head.appendChild(link);
    }

    // Cargar JS solo una vez
    // @ts-ignore
    if (window.PPaymentButtonBox) {
      resolve();
      return;
    }

    // @ts-ignore
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar el script de Payphone."));
    // @ts-ignore
    document.body.appendChild(script);
  });
}
