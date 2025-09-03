import React from "react";
import { methodSelectorStyles } from "../styles";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import PayphoneIcon from "../../../components/icons/PayphoneIcon";

interface PaymentMethodSelectorProps {
  selectedMethod: "payphone" | "becoin";
  onMethodChange: (method: "payphone" | "becoin") => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
}) => {
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
        }}
        onClick={() => onMethodChange("payphone")}
      >
        <div style={methodSelectorStyles.methodIcon}>
          <PayphoneIcon width={32} height={32} />
        </div>
        <span style={methodSelectorStyles.methodText}>Payphone</span>
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
