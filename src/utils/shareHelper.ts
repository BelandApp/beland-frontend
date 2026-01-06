import { Share, Platform, Linking } from "react-native";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

export interface ShareGroupData {
  groupName: string;
  groupId: string;
  description?: string;
  memberCount?: number;
  creatorName?: string;
}

/**
 * Genera el deep link de Expo para el grupo
 */
const generateDeepLink = (groupId: string): string => {
  // Deep link de Expo - funciona en desarrollo y producción
  // Formato: exp://IP:PORT/--/groups/ID o beland://groups/ID
  return `beland://groups/${groupId}`;
};

/**
 * Genera el mensaje de invitación para compartir un grupo
 */
const generateShareMessage = (data: ShareGroupData): string => {
  const { groupName, groupId, description } = data;
  const deepLink = generateDeepLink(groupId);

  let message = `🎉 ¡Te invito a unirte a mi grupo en Beland!\n\n`;
  message += `📌 *${groupName}*\n`;

  if (description) {
    message += `\n${description}\n`;
  }

  // Por el momento solo compartimos la URL genérica
  message += `\n🔗 Descarga la app: https://beland.app`;

  return message;
};

/**
 * Comparte el grupo en WhatsApp
 */
export const shareOnWhatsApp = async (data: ShareGroupData): Promise<void> => {
  const message = generateShareMessage(data);
  const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Fallback al share nativo si WhatsApp no está instalado
      await Share.share({ message });
    }
  } catch (error) {
    console.error("Error al compartir en WhatsApp:", error);
    throw error;
  }
};

/**
 * Comparte el grupo usando el share nativo del dispositivo
 */
export const shareNative = async (data: ShareGroupData): Promise<void> => {
  const message = generateShareMessage(data);

  try {
    const result = await Share.share({
      message,
      title: `Únete a ${data.groupName}`,
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // compartido con un tipo de actividad específico
        console.log("Compartido con:", result.activityType);
      } else {
        // compartido
        console.log("Compartido exitosamente");
      }
    } else if (result.action === Share.dismissedAction) {
      // descartado
      console.log("Compartir cancelado");
    }
  } catch (error) {
    console.error("Error al compartir:", error);
    throw error;
  }
};

/**
 * Comparte una imagen generada del grupo (para Stories)
 */
export const shareGroupImage = async (
  imageUri: string,
  data: ShareGroupData
): Promise<void> => {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Sharing no está disponible en este dispositivo");
    }

    const message = generateShareMessage(data);

    await Sharing.shareAsync(imageUri, {
      mimeType: "image/png",
      dialogTitle: `Compartir ${data.groupName}`,
      UTI: "public.png",
    });
  } catch (error) {
    console.error("Error al compartir imagen:", error);
    throw error;
  }
};

/**
 * Captura un componente React y lo comparte como imagen
 */
export const captureAndShareGroupCard = async (
  viewRef: any,
  data: ShareGroupData
): Promise<void> => {
  try {
    if (!viewRef || !viewRef.current) {
      throw new Error("Referencia a la vista no válida");
    }

    if (Platform.OS === "web") {
      // Importación dinámica para evitar errores en native si la librería trata de acceder a document/window
      const { toPng } = await import("html-to-image");

      // En React Native Web, el ref suele ser el componente.
      // Necesitamos el nodo DOM. A veces ref.current es el nodo, a veces es un wrapper.
      // Intentamos obtener el nodo DOM.
      const domNode = viewRef.current as unknown as HTMLElement;

      if (!domNode) {
        throw new Error(
          "No se pudo obtener el nodo DOM para la captura en web"
        );
      }

      const dataUrl = await toPng(domNode, { cacheBust: true });

      // En Web, "compartir" una imagen generada suele significar descargarla
      // o usar navigator.share si soporta archivos (aún limitado).
      // Vamos a intentar descargarla por defecto para asegurar funcionalidad.
      const link = document.createElement("a");
      link.download = `grupo-${data.groupName
        .replace(/\s+/g, "-")
        .toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();

      // Opcional: Si quieres intentar compartir API
      // if (navigator.share) { ... }

      return;
    }

    // NATIVE IMPLEMENTATION
    // Capturar la vista como imagen
    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });

    // Compartir la imagen
    await shareGroupImage(uri, data);
  } catch (error) {
    console.error("Error al capturar y compartir:", error);
    throw error;
  }
};

/**
 * Abre Instagram Stories (requiere configuración adicional)
 * Nota: Para Instagram Stories necesitas usar expo-sharing o react-native-share
 * con un sticker/imagen preparada
 */
export const shareToInstagramStory = async (
  imageUri: string,
  data: ShareGroupData
): Promise<void> => {
  try {
    // Instagram Stories requiere una imagen
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Sharing no disponible");
    }

    await Sharing.shareAsync(imageUri, {
      mimeType: "image/png",
      dialogTitle: `Compartir ${data.groupName} en Instagram`,
      UTI: "public.png",
    });
  } catch (error) {
    console.error("Error al compartir en Instagram:", error);
    throw error;
  }
};

/**
 * Comparte en TikTok con imagen
 */
export const shareToTikTok = async (
  imageUri: string,
  data: ShareGroupData
): Promise<void> => {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Sharing no disponible");
    }

    await Sharing.shareAsync(imageUri, {
      mimeType: "image/png",
      dialogTitle: `Compartir ${data.groupName} en TikTok`,
      UTI: "public.png",
    });
  } catch (error) {
    console.error("Error al compartir en TikTok:", error);
    throw error;
  }
};

/**
 * Muestra un menú de opciones para compartir
 */
export const showShareOptions = async (
  data: ShareGroupData,
  onOptionSelected?: (option: string) => void
): Promise<void> => {
  try {
    // Por ahora usamos el share nativo que muestra todas las opciones disponibles
    await shareNative(data);
  } catch (error) {
    console.error("Error al mostrar opciones de compartir:", error);
    throw error;
  }
};
