// TODO REFACTORIZAR PARA REACT NATIVE

import React from "react";
import "../../styles/notificationBanner.css";
import { useNotification } from "../../hooks/NotificationContext";

export const NotificationBanner: React.FC = () => {
  const { notification, hideNotification } = useNotification();

  if (!notification) return null;

  // Usar clases CSS importadas para animación
  const className = notification.visible ? "bounce-in" : "bounce-out";

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        padding: "18px 32px",
        minWidth: 260,
        maxWidth: 340,
        border: "2px solid #2ecc40",
        color: "#222",
        fontFamily: "Montserrat, Arial, sans-serif",
        opacity: notification.visible ? 1 : 0,
        pointerEvents: notification.visible ? "auto" : "none",
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 6,
              color: "#2ecc40",
            }}
          >
            {notification.title}
          </div>

          {/* Si viene meta estructurada, renderizamos en formato enriquecido */}
          {notification.meta ? (
            <div style={{ fontSize: 14, color: "#333" }}>
              {/* Nombre / código y contadores */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {notification.meta.name ||
                    notification.meta.code ||
                    notification.message}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      background: "#f1f8e9",
                      color: "#558b2f",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  >
                    Asistencias: {notification.meta.attended_count ?? "?"}
                  </div>
                  <div
                    style={{
                      background: "#fff7e6",
                      color: "#ff9800",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  >
                    Vendidas: {notification.meta.sold_tickets ?? "?"}
                  </div>
                </div>
              </div>

              {/* Datos del usuario */}
              <div style={{ fontSize: 13, color: "#444", lineHeight: 1.4 }}>
                {notification.meta.user_name && (
                  <div>
                    <strong>Nombre:</strong> {notification.meta.user_name}
                  </div>
                )}
                {notification.meta.user_phone && (
                  <div>
                    <strong>Tel:</strong> {notification.meta.user_phone}
                  </div>
                )}
                {notification.meta.user_email && (
                  <div>
                    <strong>Email:</strong> {notification.meta.user_email}
                  </div>
                )}
                {notification.meta.user_instagram_tiktok && (
                  <div>
                    <strong>IG/TikTok:</strong>{" "}
                    {notification.meta.user_instagram_tiktok}
                  </div>
                )}
                {notification.amount !== undefined && (
                  <div style={{ marginTop: 6, color: "#ff9800" }}>
                    Monto: ${notification.amount}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 16, marginBottom: 4 }}>
              {notification.message}
            </div>
          )}
        </div>

        {/* Acción: OK (si es persistente) */}
        {notification.persistent ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={hideNotification}
              style={{
                background: "#2ecc40",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Montserrat, Arial, sans-serif",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#27ae60";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2ecc40";
              }}
            >
              OK
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
