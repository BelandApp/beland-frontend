/**
 * Componente de spinner de carga
 */

import React from "react";
import { styles, keyframesCSS } from "../styles";

export const LoadingSpinner: React.FC = () => {
  return (
    <div style={styles.spinner.container}>
      <div style={styles.spinner.loader}></div>
      <style>{keyframesCSS}</style>
      <span style={styles.spinner.text}>Procesando...</span>
    </div>
  );
};
