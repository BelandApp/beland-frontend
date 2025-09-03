import React from "react";
import { headerStyles } from "../styles";

interface PaymentHeaderProps {
  commerceName: string;
  commerceImg: string;
}

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  commerceName,
  commerceImg,
}) => {
  const defaultProfileImg =
    "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";

  return (
    <div style={headerStyles.header}>
      <div style={headerStyles.commerceContainer}>
        <div style={headerStyles.commerceImage}>
          <img
            src={commerceImg || defaultProfileImg}
            alt="Comercio"
            style={headerStyles.commerceImageImg}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultProfileImg;
            }}
          />
        </div>
        <h1 style={headerStyles.commerceName}>{commerceName}</h1>
        <p style={headerStyles.commerceSubtitle}>Pago seguro</p>
      </div>
    </div>
  );
};
