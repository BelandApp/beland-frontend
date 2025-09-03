import React from "react";
import { presetAmountsStyles } from "../styles";

interface PresetAmountsProps {
  amounts: number[];
  selectedAmount: string;
  onAmountSelect: (amount: string) => void;
  canEdit: boolean;
}

export const PresetAmounts: React.FC<PresetAmountsProps> = ({
  amounts,
  selectedAmount,
  onAmountSelect,
  canEdit,
}) => {
  if (!canEdit) return null;

  return (
    <div style={presetAmountsStyles.container}>
      <div style={presetAmountsStyles.grid}>
        {amounts.map((preset) => (
          <button
            key={preset}
            type="button"
            style={{
              ...presetAmountsStyles.presetButton,
              ...(Number(selectedAmount) === preset
                ? presetAmountsStyles.presetButtonSelected
                : canEdit
                ? presetAmountsStyles.presetButtonUnselected
                : presetAmountsStyles.presetButtonDisabled),
            }}
            onClick={() => {
              if (canEdit) {
                onAmountSelect(String(preset));
              }
            }}
            disabled={!canEdit}
          >
            ${preset}
          </button>
        ))}
      </div>
    </div>
  );
};
