/**
 * Estilos para PayphoneSuccessScreen
 */

import { colors } from "@/styles/colors";
import { textAlign } from "html2canvas/dist/types/css/property-descriptors/text-align";

export const styles = {
  card: {
    marginTop: 40,
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.12)",
    border: `2px solid ${colors.belandGreen}`,
  },

  title: {
    success: {
      textAlign: "center",
      fontWeight: 800,
      marginBottom: 18,
      fontSize: 28,
      color: colors.primary,
    },
    error: {
      textAlign: "center",
      fontWeight: 800,
      marginBottom: 18,
      fontSize: 28,
      color: colors.error,
    },
  },

  statusSection: {
    marginBottom: 28,
  },

  statusLabel: {
    fontWeight: 600,
    color: colors.belandGreen,
  },

  statusValue: (isLoading: boolean, isSuccess: boolean, isError: boolean) => ({
    fontSize: 22,
    fontWeight: 700,
    color: isLoading
      ? colors.textSecondary
      : isSuccess
        ? colors.success
        : isError
          ? colors.error
          : colors.textSecondary,
  }),

  infoSection: {
    marginBottom: 18,
  },

  infoLabel: {
    fontWeight: 600,
    color: colors.belandGreen,
  },

  infoValue: {
    fontSize: 20,
    color: colors.textSecondary,
  },

  balanceBadge: {
    background: colors.belandGreen,
    color: colors.cardBackground,
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    fontSize: 20,
    fontWeight: 700,
    boxShadow: "0 2px 8px 0 #A9D19555",
  },

  redirectMessage: {
    marginTop: 18,
    fontSize: 18,
    color: colors.belandOrange,
  },

  spinner: {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      marginBottom: 18,
    },
    loader: {
      width: 48,
      height: 48,
      border: `6px solid ${colors.belandGreen}`,
      borderTop: `6px solid ${colors.belandOrange}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: 12,
    },
    text: {
      fontSize: 22,
      color: colors.textSecondary,
      fontWeight: 600,
    },
  },
};

export const keyframesCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
