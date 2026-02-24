import { Linking } from "react-native";
type contactUserProps = (props: {
  phone: string | undefined;
  mail: string;
}) => void;
export const openWhatsapp = (phone: string) => {
  const url = `https://wa.me/${phone}`;

  Linking.openURL(url).catch((err) =>
    console.error("Error opening WhatsApp", err),
  );
};

export const openMail = (mail: string) => {
  const url = `mailto:${mail}`;
  Linking.openURL(url).catch((err) => console.error("Error opening Mail", err));
};

export const contactUser: contactUserProps = ({ phone, mail }) => {
  const url = phone ? `https://wa.me/${phone}` : `mailto:${mail}`;
  Linking.openURL(url).catch((err) =>
    console.error("Error contacting user", err),
  );
};
