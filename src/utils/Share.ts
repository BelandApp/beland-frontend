import { Share, Platform, Linking } from "react-native";
import { notify } from "src/hooks/notification/notify.external";

type ShareOptions = {
  message: string;
  url?: string;
  title?: string;
};

const encode = (text: string) => encodeURIComponent(text);

export const share = async ({ message, url, title }: ShareOptions) => {
  try {
    const content = url ? `${message}\n${url}` : message;

    if (Platform.OS === "web") {
      if (navigator.share) {
        await navigator.share({ text: content, title, url });
        return;
      }

      // fallback web
      await navigator.clipboard.writeText(content);
      notify.info({ message: "Contenido copiado al portapapeles" });
      return;
    }

    await Share.share({
      message: content,
      title,
    });
  } catch (error) {
    notify.error({ message: "Error al compartir" });
    throw error;
  }
};

type WhatsAppOptions = {
  message: string;
  phone?: string; // opcional
};

export const shareWhatsApp = async ({ message, phone }: WhatsAppOptions) => {
  try {
    const encoded = encode(message);

    // WEB
    if (Platform.OS === "web") {
      const url = phone
        ? `https://wa.me/${phone}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;

      window.open(url, "_blank");
      return;
    }

    // NATIVE
    const url = phone
      ? `whatsapp://send?phone=${phone}&text=${encoded}`
      : `whatsapp://send?text=${encoded}`;

    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // fallback sólido
      await share({ message });
    }
  } catch (error) {
    notify.error({ message: "Error al compartir en WhatsApp" });
    throw error;
  }
};

export interface ShareGroupData {
  groupName: string;
  groupId: string;
  description?: string;
}

export const buildGroupLinks = (groupId: string) => ({
  deepLink: `beland://groups/${groupId}`,
  webLink: `https://beland.app/groups/${groupId}`,
});

export const buildGroupMessage = (
  data: ShareGroupData,
  platform: "web" | "native",
) => {
  const { groupName, description, groupId } = data;
  const { deepLink, webLink } = buildGroupLinks(groupId);

  const link = platform === "web" ? webLink : deepLink;

  return `🎉 ¡Te invito a unirte a mi grupo en Beland!

📌 ${groupName}
${description ? `\n${description}` : ""}

🔗 ${link}`;
};
