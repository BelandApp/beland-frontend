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
              {/* Renderizado según tipo de notificación */}
              {notification.meta.type === "order" ? (
                // Notificación de ORDEN con diseño profesional
                <div>
                  {/* ID de orden destacado */}
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#ff6b35",
                      marginBottom: 12,
                      padding: "8px 12px",
                      background:
                        "linear-gradient(135deg, #fff4e6 0%, #ffe8d6 100%)",
                      borderRadius: 8,
                      border: "2px solid #ff6b35",
                      textAlign: "center",
                    }}
                  >
                    #{notification.meta.short_id || notification.meta.order_id}
                  </div>

                  {/* Detalles de la orden */}
                  <div style={{ marginBottom: 12 }}>
                    {/* Cantidad de items */}
                    {notification.meta.items_count > 0 && (
                      <div
                        style={{
                          background: "#e3f2fd",
                          color: "#1976d2",
                          padding: "8px 12px",
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 600,
                          marginBottom: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>📦</span>
                        <span>
                          {notification.meta.items_count} producto
                          {notification.meta.items_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Totales con monedas claramente identificadas */}
                  <div
                    style={{
                      padding: "12px 14px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: 10,
                      color: "#fff",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{ fontSize: 13, opacity: 0.95, fontWeight: 500 }}
                      >
                        💵 Total USD:
                      </span>
                      <span style={{ fontSize: 20, fontWeight: 700 }}>
                        ${notification.meta.total_usd?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "1px",
                        background: "rgba(255,255,255,0.2)",
                        margin: "8px 0",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{ fontSize: 13, opacity: 0.95, fontWeight: 500 }}
                      >
                        🪙 Total Becoins:
                      </span>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#ffd54f",
                        }}
                      >
                        {notification.meta.total_becoin?.toLocaleString() ||
                          "0"}{" "}
                        BC
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Notificación de EVENT-PASS (código de entrada)
                <div>
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
              )}
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
