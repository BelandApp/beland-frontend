/**
 * Componente para mostrar mensaje de redirección
 */

import React from "react";
import { styles } from "../styles";
import { STATUS_MESSAGES } from "../constants";
import { Text } from "react-native";

interface RedirectMessageProps {
  status: string;
}

export const RedirectMessage: React.FC<RedirectMessageProps> = ({ status }) => {
  if (status !== STATUS_MESSAGES.RECHARGE_SUCCESS) return null;

  return (
    <Text style={styles.redirectMessage}>Redirigiendo a tu billetera...</Text>
  );
};
