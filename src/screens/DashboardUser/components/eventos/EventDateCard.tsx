import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";

interface Props {
  label: string;
  value?: any;
  onChange: (d: Date) => void;
  error?: string;
  loading?: boolean;
}

export default function EventDateCard({ label, value, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [dateText, setDateText] = useState("");
  const [timeText, setTimeText] = useState("");
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );
  const isSmall = windowWidth < 420;

  useEffect(() => {
    const handler = ({ window }: { window: { width: number } }) =>
      setWindowWidth(window.width);
    const sub: any = Dimensions.addEventListener
      ? Dimensions.addEventListener("change", handler)
      : null;
    return () => {
      try {
        if (sub && typeof sub.remove === "function") sub.remove();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const safeDate = value ? new Date(value) : new Date();

  const formatDay = (d: Date) => String(d.getDate());
  const formatMonth = (d: Date) =>
    d.toLocaleString("es-ES", { month: "short" });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const open = () => {
    setDateText(
      `${String(safeDate.getDate()).padStart(2, "0")}/${String(
        safeDate.getMonth() + 1
      ).padStart(2, "0")}/${safeDate.getFullYear()}`
    );
    setTimeText(
      `${String(safeDate.getHours()).padStart(2, "0")}:${String(
        safeDate.getMinutes()
      ).padStart(2, "0")}`
    );
    setVisible(true);
  };

  const onlyDigits = (s: string) => s.replace(/\D/g, "");

  const handleDateChange = (text: string) => {
    // Keep digits only and limit to 8 (DDMMYYYY)
    const digits = onlyDigits(text).slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(
        4
      )}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setDateText(formatted);
    setDateError("");
  };

  const handleTimeChange = (text: string) => {
    // Keep digits only and limit to 4 (HHMM)
    const digits = onlyDigits(text).slice(0, 4);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }
    setTimeText(formatted);
    setTimeError("");
  };

  const onSave = () => {
    try {
      const [dStr, mStr, yStr] = dateText.split("/");
      const [hStr, minStr] = timeText.split(":");
      const d = Number(dStr);
      const m = Number(mStr);
      const y = Number(yStr);
      const h = Number(hStr);
      const min = Number(minStr);

      let hasError = false;

      if (!dStr || !mStr || !yStr || isNaN(d) || isNaN(m) || isNaN(y)) {
        setDateError("Formato inválido. Usa DD/MM/YYYY");
        hasError = true;
      } else if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
        setDateError("Fecha fuera de rango");
        hasError = true;
      }

      if (!hStr || !minStr || isNaN(h) || isNaN(min)) {
        setTimeError("Formato inválido. Usa HH:MM");
        hasError = true;
      } else if (h < 0 || h > 23 || min < 0 || min > 59) {
        setTimeError("Hora fuera de rango");
        hasError = true;
      }

      if (hasError) return;

      const nd = new Date(y, m - 1, d, h, min);
      onChange(nd);
      setVisible(false);
    } catch (e) {
      // no-op
      setDateError("Formato inválido");
      setTimeError("");
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={open}
        className="bg-white rounded-lg p-3"
        accessibilityRole="button"
      >
        <Text className="text-xs text-text-secondary-light mb-2">{label}</Text>
        <View
          className={
            isSmall ? "flex-col" : "flex-row items-center justify-between"
          }
        >
          <View>
            <View
              className={
                isSmall ? "flex-row items-center" : "flex-row items-baseline"
              }
            >
              <Text
                className={isSmall ? "text-xl font-bold" : "text-2xl font-bold"}
              >
                {formatDay(safeDate)}
              </Text>
              <Text
                className={
                  isSmall
                    ? "ml-3 text-base font-semibold"
                    : "ml-2 text-lg font-semibold"
                }
              >
                {formatMonth(safeDate)}
              </Text>
            </View>
          </View>
          <View className={isSmall ? "items-start mt-3" : "items-end"}>
            <Text className="text-xs text-text-secondary-light">Hora</Text>
            <Text
              className={
                isSmall
                  ? "text-lg font-bold text-primary"
                  : "text-2xl font-bold text-primary"
              }
            >
              {formatTime(safeDate)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View
            style={{ width: Math.min(520, windowWidth - 40) }}
            className="bg-white rounded-xl p-4"
          >
            <Text className="text-lg font-bold mb-3">
              Seleccionar fecha y hora
            </Text>
            <TextInput
              className="border border-gray-200 rounded-md p-3 mb-1"
              value={dateText}
              onChangeText={handleDateChange}
              placeholder="DD/MM/YYYY"
              keyboardType="numeric"
              maxLength={10}
            />
            {dateError ? (
              <Text className="text-sm text-red-600 mb-2">{dateError}</Text>
            ) : null}
            <TextInput
              className="border border-gray-200 rounded-md p-3 mb-1"
              value={timeText}
              onChangeText={handleTimeChange}
              placeholder="HH:MM"
              keyboardType="numeric"
              maxLength={5}
            />
            {timeError ? (
              <Text className="text-sm text-red-600 mb-2">{timeError}</Text>
            ) : null}
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="px-4 py-2 rounded-md"
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onSave}
                className="px-4 py-2 rounded-md bg-primary"
              >
                <Text className="text-white">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
