import React from "react";
import { methodSelectorStyles } from "../styles";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import PayphoneIcon from "../../../components/icons/PayphoneIcon";

interface PaymentMethodSelectorProps {
  selectedMethod: "payphone" | "becoin";
  onMethodChange: (method: "payphone" | "becoin") => void;
  isPayphoneAvailable?: boolean;
  shouldForceBeCoins?: boolean;
  effectiveAmount?: number;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  isPayphoneAvailable = true,
  shouldForceBeCoins = false,
  effectiveAmount = 0,
}) => {
  // Si se debe forzar BeCoins, cambiar automáticamente
  React.useEffect(() => {
    if (shouldForceBeCoins && selectedMethod === "payphone") {
      onMethodChange("becoin");
    }
  }, [shouldForceBeCoins, selectedMethod, onMethodChange]);

  return (
    <div style={methodSelectorStyles.container}>
      <button
        type="button"
        style={{
          ...methodSelectorStyles.methodButton,
          ...(selectedMethod === "payphone"
            ? methodSelectorStyles.methodButtonActive
            : methodSelectorStyles.methodButtonInactive),
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
          borderRight: "1px solid #e8f4fd",
          opacity: isPayphoneAvailable ? 1 : 0.5,
          cursor: isPayphoneAvailable ? "pointer" : "not-allowed",
        }}
        onClick={() => isPayphoneAvailable && onMethodChange("payphone")}
        disabled={!isPayphoneAvailable}
      >
        <div style={methodSelectorStyles.methodIcon}>
          <PayphoneIcon width={32} height={32} />
        </div>
        <span style={methodSelectorStyles.methodText}>Payphone</span>
        {!isPayphoneAvailable && effectiveAmount < 1 && (
          <div style={{ fontSize: "10px", color: "#ff6b6b", marginTop: "2px" }}>
            Mínimo $1.00
          </div>
        )}
      </button>

      <button
        type="button"
        style={{
          ...methodSelectorStyles.methodButton,
          ...(selectedMethod === "becoin"
            ? methodSelectorStyles.methodButtonActive
            : methodSelectorStyles.methodButtonInactive),
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          borderLeft: "1px solid #e8f4fd",
        }}
        onClick={() => onMethodChange("becoin")}
      >
        <div style={methodSelectorStyles.methodIcon}>
          <BeCoinIcon />
        </div>
        <span style={methodSelectorStyles.methodText}>BeCoins</span>
      </button>
    </div>
  );
};
