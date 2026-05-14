import React from "react";
import { methodSelectorStyles } from "../styles";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import PayphoneIcon from "../../../components/icons/PayphoneIcon";

interface PaymentMethodSelectorProps {
  selectedMethod: "payphone" | "becoin" | "bank_transfer";
  onMethodChange: (method: "payphone" | "becoin" | "bank_transfer") => void;
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
