/**
 * Componente para mostrar mensaje de redirección
 */

import React from "react";
import { styles } from "../styles";
import { STATUS_MESSAGES } from "../constants";

interface RedirectMessageProps {
  status: string;
}

export const RedirectMessage: React.FC<RedirectMessageProps> = ({ status }) => {
  if (status !== STATUS_MESSAGES.RECHARGE_SUCCESS) return null;

  return (
    <div style={styles.redirectMessage}>Redirigiendo a tu billetera...</div>
  );
};
