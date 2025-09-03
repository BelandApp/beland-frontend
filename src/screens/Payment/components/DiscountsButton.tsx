import React from 'react';

interface DiscountsButtonProps {
  totalDiscounts: number;
  onClick: () => void;
}

export const DiscountsButton: React.FC<DiscountsButtonProps> = ({
  totalDiscounts,
  onClick,
}) => {
  if (totalDiscounts === 0) return null;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        border: '1px solid #E5E5E7',
        marginBottom: 16,
      }}
    >
      <button
        style={{
          width: "100%",
          padding: "16px 20px",
          background: "linear-gradient(135deg, #34C759, #30B147)",
          color: "white",
          border: "none",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 12px rgba(52, 199, 89, 0.2)",
          transition: "all 0.3s ease",
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(52, 199, 89, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(52, 199, 89, 0.2)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🎟️</span>
          <div style={{ textAlign: "left" as const }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              Ver descuentos disponibles
            </div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              {totalDiscounts} descuentos disponibles
            </div>
          </div>
        </div>
        <span style={{ fontSize: 18 }}>→</span>
      </button>
    </div>
  );
};

export default DiscountsButton;
