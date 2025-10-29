import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from "react-native";

interface IntuitiveDatePickerProps {
  label: string;
  value: Date;
  onSelect: (date: Date) => void;
  error?: string;
  loading?: boolean;
}

const IntuitiveDatePicker: React.FC<IntuitiveDatePickerProps> = ({
  label,
  value,
  onSelect,
  error,
  loading = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [dateInputValue, setDateInputValue] = useState("");
  const [timeInputValue, setTimeInputValue] = useState("");
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [isTimeFocused, setIsTimeFocused] = useState(false);

  const formatDisplayDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return "🗓️ Toca aquí para seleccionar fecha y hora";
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return `🕐 Hoy a las ${date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (isTomorrow) {
      return `📅 Mañana a las ${date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return `📅 ${date.toLocaleDateString("es-ES", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })} a las ${date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const getQuickOptions = () => {
    const now = new Date();
    const options = [];

    // Ahora
    options.push({
      text: "⏰ Ahora",
      date: new Date(now),
    });

    // En 1 hora
    const inOneHour = new Date(now);
    inOneHour.setHours(inOneHour.getHours() + 1);
    options.push({
      text: "⏰ En 1 hora",
      date: inOneHour,
    });

    // En 2 horas
    const inTwoHours = new Date(now);
    inTwoHours.setHours(inTwoHours.getHours() + 2);
    options.push({
      text: "⏰ En 2 horas",
      date: inTwoHours,
    });

    // Mañana 2 PM
    const tomorrow2PM = new Date(now);
    tomorrow2PM.setDate(tomorrow2PM.getDate() + 1);
    tomorrow2PM.setHours(14, 0, 0, 0);
    options.push({
      text: "📅 Mañana 2 PM",
      date: tomorrow2PM,
    });

    return options;
  };

  const getPopularTimes = () => {
    const now = new Date();
    const today = new Date(now);

    return [
      { text: "09:00", hours: 9, minutes: 0 },
      { text: "12:00", hours: 12, minutes: 0 },
      { text: "15:00", hours: 15, minutes: 0 },
      { text: "18:00", hours: 18, minutes: 0 },
      { text: "20:00", hours: 20, minutes: 0 },
    ].map((time) => {
      const timeDate = new Date(today);
      timeDate.setHours(time.hours, time.minutes, 0, 0);
      return {
        text: `🕐 ${time.text}`,
        date: timeDate,
      };
    });
  };

  const handleQuickSelect = (selectedDate: Date) => {
    onSelect(selectedDate);
    setShowModal(false);
  };

  const handleDateInputChange = (dateString: string) => {
    setDateInputValue(dateString);
    if (dateString) {
      const [year, month, day] = dateString.split("-").map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const newDate = new Date(safeValue);
        newDate.setFullYear(year);
        newDate.setMonth(month - 1);
        newDate.setDate(day);
        onSelect(newDate);
      }
    }
  };

  const handleTimeInputChange = (timeString: string) => {
    setTimeInputValue(timeString);
    if (timeString) {
      const [hours, minutes] = timeString.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const newDate = new Date(safeValue);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        onSelect(newDate);
      }
    }
  };

  const getCurrentDateValue = () => {
    if (isDateFocused && dateInputValue !== "") {
      return dateInputValue;
    }
    const year = safeValue.getFullYear();
    const month = String(safeValue.getMonth() + 1).padStart(2, "0");
    const day = String(safeValue.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCurrentTimeValue = () => {
    if (isTimeFocused && timeInputValue !== "") {
      return timeInputValue;
    }
    const hours = String(safeValue.getHours()).padStart(2, "0");
    const minutes = String(safeValue.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const safeValue = value && !isNaN(value.getTime()) ? value : new Date();

  return (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>

        <TouchableOpacity
          style={[styles.intuitiveDateButton, error && styles.inputError]}
          onPress={() => setShowModal(true)}
          disabled={loading}
        >
          <View style={styles.intuitiveDateContent}>
            <Text style={styles.intuitiveDateText}>
              {formatDisplayDate(safeValue)}
            </Text>
            <Text style={styles.intuitiveChangeText}>Toca para cambiar</Text>
          </View>
          <Text style={styles.intuitiveArrowText}>›</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.intuitiveModalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.intuitiveDateModal}>
              <View style={styles.intuitiveModalHeader}>
                <Text style={styles.intuitiveModalTitle}>
                  ⏰ ¿Cuándo será el evento?
                </Text>
                <TouchableOpacity
                  style={styles.intuitiveCloseButtonContainer}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.intuitiveCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.intuitiveModalContent}>
                {/* Opciones rápidas */}
                <View style={styles.intuitiveQuickSection}>
                  <Text style={styles.intuitiveSectionTitle}>
                    🚀 Opciones rápidas
                  </Text>
                  <View style={styles.intuitiveQuickOptions}>
                    {getQuickOptions().map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.intuitiveQuickOption}
                        onPress={() => handleQuickSelect(option.date)}
                      >
                        <Text style={styles.intuitiveQuickOptionText}>
                          {option.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Horarios populares */}
                <View style={styles.intuitiveQuickSection}>
                  <Text style={styles.intuitiveSectionTitle}>
                    ⭐ Horarios populares hoy
                  </Text>
                  <View style={styles.intuitiveQuickOptions}>
                    {getPopularTimes().map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.intuitiveQuickTimeOption}
                        onPress={() => handleQuickSelect(option.date)}
                      >
                        <Text style={styles.intuitiveQuickOptionText}>
                          {option.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Fecha y hora específicas */}
                <View style={styles.intuitiveQuickSection}>
                  <Text style={styles.intuitiveSectionTitle}>
                    🎯 Fecha y hora específicas
                  </Text>

                  {Platform.OS === "web" ? (
                    <View style={styles.specificDateTimeContainer}>
                      <View style={styles.specificInputGroup}>
                        <Text style={styles.specificInputLabel}>📅 Fecha</Text>
                        <TextInput
                          style={styles.specificDateInput}
                          value={getCurrentDateValue()}
                          onChangeText={handleDateInputChange}
                          onFocus={() => {
                            setIsDateFocused(true);
                            setDateInputValue("");
                          }}
                          onBlur={() => setIsDateFocused(false)}
                          placeholder="YYYY-MM-DD"
                          // @ts-ignore
                          type="date"
                          min={(() => {
                            const today = new Date();
                            const year = today.getFullYear();
                            const month = String(today.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const day = String(today.getDate()).padStart(
                              2,
                              "0"
                            );
                            return `${year}-${month}-${day}`;
                          })()}
                        />
                      </View>

                      <View style={styles.specificInputGroup}>
                        <Text style={styles.specificInputLabel}>🕐 Hora</Text>
                        <TextInput
                          style={styles.specificTimeInput}
                          value={getCurrentTimeValue()}
                          onChangeText={handleTimeInputChange}
                          onFocus={() => {
                            setIsTimeFocused(true);
                            setTimeInputValue("");
                          }}
                          onBlur={() => setIsTimeFocused(false)}
                          placeholder="HH:MM"
                          // @ts-ignore
                          type="time"
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.mobileSpecificContainer}>
                      <TouchableOpacity
                        style={styles.mobileSpecificButton}
                        onPress={() => {
                          Alert.prompt(
                            "Hora específica",
                            "Introduce la hora en formato HH:MM (ej: 14:30)",
                            [
                              { text: "Cancelar", style: "cancel" },
                              {
                                text: "OK",
                                onPress: (timeText: string | undefined) => {
                                  if (timeText && timeText.includes(":")) {
                                    const [hours, minutes] = timeText
                                      .split(":")
                                      .map(Number);
                                    if (
                                      !isNaN(hours) &&
                                      !isNaN(minutes) &&
                                      hours >= 0 &&
                                      hours <= 23 &&
                                      minutes >= 0 &&
                                      minutes <= 59
                                    ) {
                                      const newDate = new Date(safeValue);
                                      newDate.setHours(hours);
                                      newDate.setMinutes(minutes);
                                      onSelect(newDate);
                                    }
                                  }
                                },
                              },
                            ],
                            "plain-text",
                            `${String(safeValue.getHours()).padStart(
                              2,
                              "0"
                            )}:${String(safeValue.getMinutes()).padStart(
                              2,
                              "0"
                            )}`
                          );
                        }}
                      >
                        <Text style={styles.mobileSpecificButtonText}>
                          🕐 Cambiar hora:{" "}
                          {String(safeValue.getHours()).padStart(2, "0")}:
                          {String(safeValue.getMinutes()).padStart(2, "0")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.mobileSpecificButton}
                        onPress={() => {
                          Alert.prompt(
                            "Fecha específica",
                            "Introduce la fecha en formato DD/MM/YYYY",
                            [
                              { text: "Cancelar", style: "cancel" },
                              {
                                text: "OK",
                                onPress: (dateText: string | undefined) => {
                                  if (dateText && dateText.includes("/")) {
                                    const [day, month, year] = dateText
                                      .split("/")
                                      .map(Number);
                                    if (
                                      !isNaN(day) &&
                                      !isNaN(month) &&
                                      !isNaN(year)
                                    ) {
                                      const newDate = new Date(safeValue);
                                      newDate.setFullYear(year);
                                      newDate.setMonth(month - 1);
                                      newDate.setDate(day);
                                      onSelect(newDate);
                                    }
                                  }
                                },
                              },
                            ],
                            "plain-text",
                            `${String(safeValue.getDate()).padStart(
                              2,
                              "0"
                            )}/${String(safeValue.getMonth() + 1).padStart(
                              2,
                              "0"
                            )}/${safeValue.getFullYear()}`
                          );
                        }}
                      >
                        <Text style={styles.mobileSpecificButtonText}>
                          📅 Cambiar fecha:{" "}
                          {safeValue.toLocaleDateString("es-ES")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>

              <View style={styles.intuitiveModalFooter}>
                <Text style={styles.intuitiveCurrentSelection}>
                  Seleccionado: {formatDisplayDate(safeValue)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputError: {
    borderColor: "#ff4757",
  },
  errorText: {
    color: "#ff4757",
    fontSize: 12,
    marginTop: 4,
  },
  // Estilos para el botón principal
  intuitiveDateButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 60,
  },
  intuitiveDateContent: {
    flex: 1,
  },
  intuitiveDateText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 4,
  },
  intuitiveChangeText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  intuitiveArrowText: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "bold",
  },
  // Estilos para el modal
  intuitiveModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  intuitiveDateModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  intuitiveModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  intuitiveModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  intuitiveCloseButtonContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  intuitiveCloseButton: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  intuitiveModalContent: {
    padding: 20,
  },
  intuitiveQuickSection: {
    marginBottom: 24,
  },
  intuitiveSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  intuitiveQuickOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  intuitiveQuickOption: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  intuitiveQuickTimeOption: {
    backgroundColor: "#34C759",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  intuitiveQuickOptionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  intuitiveModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#f9f9f9",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  intuitiveCurrentSelection: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  // Estilos para fecha y hora específicas
  specificDateTimeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  specificInputGroup: {
    flex: 1,
  },
  specificInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  specificDateInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  specificTimeInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  mobileSpecificContainer: {
    gap: 12,
  },
  mobileSpecificButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  mobileSpecificButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});

export default IntuitiveDatePicker;
