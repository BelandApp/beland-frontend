import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCobrar, SUGGESTED_AMOUNTS, CURRENCIES } from "./hooks/useCobrar";
import { useState } from "react";

export default function CobrarScreen() {
  const {
    amount,
    concept,
    selectedCurrency,
    isGeneratingQR,
    qrCode,
    numericAmount,
    beCoinsAmount,
    isValid,
    selectedCurrencyData,
    handleAmountChange,
    handleSuggestedAmount,
    handleConceptChange,
    handleCurrencySelect,
    handleGenerateQR,
    handleResetQR,
    handleEditPresets,
    presets,
    loadingPresets,
    createPreset,
    deletePreset,
    amounts,
    loadingAmounts,
    createAmount,
    deleteAmount,
    transactions,
    loadingTransactions,
    fetchTransactions,
  } = useCobrar();

  const navigation = useNavigation<any>();

  const [showPresetForm, setShowPresetForm] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetAmount, setPresetAmount] = useState("");
  const [presetMessage, setPresetMessage] = useState("");
  // transactions from API might come as [items, total], { items, total } or direct array
  let txItems: any[] = [];
  if (
    Array.isArray(transactions) &&
    transactions.length > 0 &&
    Array.isArray(transactions[0])
  ) {
    txItems = transactions[0];
  } else if (transactions && Array.isArray((transactions as any).items)) {
    txItems = (transactions as any).items;
  } else if (Array.isArray(transactions)) {
    txItems = transactions as any[];
  } else {
    txItems = [];
  }

  // Helper to extract amount and its unit from different transaction shapes
  const extractAmount = (
    tx: any
  ): { value: any; unit: "BC" | "USD" | "UNKNOWN" } => {
    if (!tx) return { value: null, unit: "UNKNOWN" };
    // explicit becoin fields
    if (tx.amount_becoin !== undefined && tx.amount_becoin !== null)
      return { value: tx.amount_becoin, unit: "BC" };
    if (tx.amount_bec !== undefined && tx.amount_bec !== null)
      return { value: tx.amount_bec, unit: "BC" };

    // explicit USD fields
    if (tx.amount_usd !== undefined && tx.amount_usd !== null)
      return { value: tx.amount_usd, unit: "USD" };
    if (tx.amountUsd !== undefined && tx.amountUsd !== null)
      return { value: tx.amountUsd, unit: "USD" };

    // generic 'amount' field: need heuristic
    if (tx.amount !== undefined && tx.amount !== null) {
      const raw = String(tx.amount);
      const parsed = parseFloat(raw.replace(/,/g, "."));
      if (!isNaN(parsed)) {
        // Heuristic: if parsed is large (>100) or integer, assume BC; otherwise assume USD
        if (parsed >= 100 || (Number.isInteger(parsed) && parsed >= 1)) {
          return { value: tx.amount, unit: "BC" };
        }
        return { value: tx.amount, unit: "USD" };
      }
    }

    // nested data
    if (tx.data && (tx.data.amount || tx.data.total))
      return { value: tx.data.amount || tx.data.total, unit: "UNKNOWN" };

    // fallback: first numeric-like property
    for (const k of Object.keys(tx)) {
      const v = tx[k];
      if (typeof v === "number") return { value: v, unit: "UNKNOWN" };
      if (typeof v === "string" && /^\d+(?:[\.,]\d+)?$/.test(v))
        return { value: v, unit: "UNKNOWN" };
    }

    return { value: null, unit: "UNKNOWN" };
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <StatusBar barStyle="light-content" />

      {/* Header con gradiente naranja */}
      <View className="bg-orange-500 pb-24 pt-6 px-6 relative overflow-hidden shadow-lg">
        {/* Decoraciones de fondo */}
        <View
          className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full"
          style={{ opacity: 0.3 }}
        />
        <View
          className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-black/5 rounded-full"
          style={{ opacity: 0.2 }}
        />

        <View className="relative z-10">
          {/* Barra superior */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="flex-row items-center gap-2 bg-white/20 py-2 pl-2 pr-4 rounded-full active:bg-white/30"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
              <Text className="text-white font-medium text-sm">Volver</Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-2 bg-white/20 rounded-full pl-3 pr-4 py-1.5 border border-white/20">
              <Ionicons name="shield-checkmark" size={18} color="white" />
              <Text className="text-white text-sm font-semibold">Comercio</Text>
            </View>
          </View>

          {/* Título y descripción */}
          <View>
            <Text className="text-white text-3xl font-bold mb-2">
              Generar Cobro
            </Text>
            <Text className="text-white/80 text-base font-medium">
              Crea un código QR para recibir pagos de forma segura e
              instantánea.
            </Text>
          </View>
        </View>
      </View>

      {/* Contenido principal */}
      <ScrollView
        className="flex-1 px-4 -mt-20 relative z-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 mb-12">
          {/* Sección de Monto */}
          <View className="p-8 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            {/* Label con indicador */}
            <View className="mb-8">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-orange-500" />
                <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Monto a cobrar
                </Text>
              </View>
            </View>

            {/* Input de Monto Grande */}
            <View className="items-center mb-8">
              <View className="flex-row items-center justify-center w-full">
                <Text className="text-5xl font-medium  text-gray-300 dark:text-gray-600 ">
                  {selectedCurrencyData.symbol}
                </Text>
                <TextInput
                  className="text-7xl font-bold text-gray-800 dark:text-white text-center "
                  placeholder="0.00"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={handleAmountChange}
                  maxLength={10}
                />
              </View>
            </View>

            {/* Selector de Moneda */}
            <View className="items-center">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row gap-2"
                contentContainerStyle={{ gap: 8 }}
              >
                {CURRENCIES.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    onPress={() => handleCurrencySelect(currency.code)}
                    className={`px-5 py-2.5 rounded-full border flex-row justify-center items-center gap-2 ${
                      selectedCurrency === currency.code
                        ? "bg-orange-500 border-orange-500"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <View className="w-5 h-5 rounded-full bg-gray-200 items-center justify-center">
                      <Text className="text-xs">{currency.flag}</Text>
                    </View>
                    <Text
                      className={`text-xs font-bold uppercase tracking-wider ${
                        selectedCurrency === currency.code
                          ? "text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {currency.code} - {currency.name}
                    </Text>
                    {selectedCurrency === currency.code && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="white"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Sección de Montos Sugeridos y Concepto */}
          <View className="bg-gray-50/50 dark:bg-gray-900/30 p-8">
            {/* Header de Montos Sugeridos */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Montos sugeridos
              </Text>
              <TouchableOpacity
                onPress={handleEditPresets}
                className="flex-row items-center gap-1 px-2 py-1 rounded active:bg-orange-500/10"
              >
                <Ionicons name="options" size={16} color="#F58220" />
                <Text className="text-xs font-semibold text-orange-500">
                  Editar Presets
                </Text>
              </TouchableOpacity>
            </View>

            {/* Grid de Montos */}
            <View className="flex-row flex-wrap gap-3 mb-6">
              {(presets && presets.length > 0
                ? presets
                : SUGGESTED_AMOUNTS.map((v) => ({
                    id: `s-${v}`,
                    amount: v,
                    name: null,
                  }))
              ).map((preset: any) => (
                <View
                  key={preset.id}
                  className="relative"
                  style={{ minWidth: "30%" }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      handleSuggestedAmount(preset.amount);
                      // Rellenar el concepto con el mensaje del preset si existe
                      handleConceptChange(preset.message || "");
                    }}
                    className="py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl active:border-orange-500 active:bg-orange-500/5 shadow-sm items-center justify-center"
                    style={{ paddingVertical: 12, paddingHorizontal: 8 }}
                  >
                    <Text className="text-lg font-bold text-gray-600 dark:text-gray-300 text-center">
                      {preset.name ? `${preset.name} - ` : ""}
                      {selectedCurrencyData.symbol}
                      {Number(preset.amount).toFixed(2)}
                    </Text>
                    {preset.message ? (
                      <Text className="text-sm text-teal-600 mt-1 text-center">
                        {preset.message}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                  {/* Delete button for real presets */}
                  {preset.id &&
                    String(preset.id).startsWith("s-") === false && (
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "#fff",
                          borderRadius: 12,
                          padding: 4,
                          borderWidth: 1,
                          borderColor: "#E53E3E",
                          zIndex: 2,
                        }}
                        onPress={() => deletePreset(preset.id)}
                      >
                        <Ionicons name="close" size={14} color="#E53E3E" />
                      </TouchableOpacity>
                    )}
                </View>
              ))}

              {/* Botón de agregar (muestra formulario inline) */}
              <TouchableOpacity
                onPress={() => setShowPresetForm((p) => !p)}
                className="py-3 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl"
                style={{ minWidth: "30%", paddingVertical: 12 }}
              >
                <Text className="text-lg font-bold text-gray-400 dark:text-gray-500 text-center">
                  +
                </Text>
              </TouchableOpacity>
            </View>

            {/* Formulario inline para crear preset */}
            {showPresetForm && (
              <View className="mb-4">
                <TextInput
                  className="w-full pl-4 pr-4 py-3 text-base rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
                  placeholder="Nombre del preset"
                  value={presetName}
                  onChangeText={setPresetName}
                />
                <TextInput
                  className="w-full pl-4 pr-4 py-3 text-base rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
                  placeholder="Monto (USD)"
                  keyboardType="decimal-pad"
                  value={presetAmount}
                  onChangeText={setPresetAmount}
                />
                <TextInput
                  className="w-full pl-4 pr-4 py-3 text-base rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
                  placeholder="Mensaje (opcional)"
                  value={presetMessage}
                  onChangeText={setPresetMessage}
                />
                <TouchableOpacity
                  className="bg-orange-500 py-3 rounded-2xl items-center"
                  onPress={async () => {
                    const amt = Number(presetAmount);
                    if (!presetName || isNaN(amt) || amt <= 0) {
                      Alert.alert(
                        "Error",
                        "Nombre y monto válido son requeridos"
                      );
                      return;
                    }
                    await createPreset({
                      name: presetName,
                      amount: amt,
                      message: presetMessage,
                    });
                    setPresetName("");
                    setPresetAmount("");
                    setPresetMessage("");
                    setShowPresetForm(false);
                  }}
                >
                  <Text className="text-white font-bold">Agregar preset</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Divisor */}
            <View className="border-t border-gray-200 dark:border-gray-700 my-6" />

            {/* Concepto del cobro */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 ml-1">
                Concepto del cobro{" "}
                <Text className="text-gray-300 font-normal">(Opcional)</Text>
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                  <Ionicons name="create-outline" size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  className="w-full pl-11 pr-4 py-3.5 text-base rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Ej. Pago servicios de consultoría"
                  placeholderTextColor="#9CA3AF"
                  value={concept}
                  onChangeText={handleConceptChange}
                  maxLength={100}
                />
              </View>
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-1">
                {concept.length}/100 caracteres
              </Text>
            </View>

            {/* Resumen si hay monto */}
            {amount && numericAmount > 0 && (
              <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4 mb-6">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Monto a cobrar
                  </Text>
                  <Text className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedCurrencyData.symbol}
                    {numericAmount.toFixed(2)} {selectedCurrency}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Equivalente en BeCoins
                  </Text>
                  <Text className="text-lg font-bold text-green-600 dark:text-green-400">
                    {beCoinsAmount.toLocaleString()} BC
                  </Text>
                </View>
              </View>
            )}

            {/* Botón de Generar QR */}
            <TouchableOpacity
              disabled={!isValid || isGeneratingQR}
              onPress={handleGenerateQR}
              className={`w-full py-4 px-6 rounded-2xl shadow-lg items-center ${
                isValid && !isGeneratingQR
                  ? "bg-orange-500 active:bg-orange-600"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              {isGeneratingQR ? (
                <View className="flex-row items-center gap-3">
                  <ActivityIndicator color="white" />
                  <Text className="text-white font-bold text-lg">
                    Generando...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-3">
                  <Ionicons
                    name="qr-code"
                    size={24}
                    color={isValid ? "white" : "#9CA3AF"}
                  />
                  <Text
                    className={`font-bold text-lg ${
                      isValid
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    Generar Código QR
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Mostrar QR si existe */}
            {qrCode ? (
              <View className="items-center mt-4">
                {isGeneratingQR ? (
                  <ActivityIndicator size="large" color="#F59E0B" />
                ) : (
                  <>
                    <View style={{ position: "relative", marginTop: 12 }}>
                      <Image
                        source={{ uri: qrCode }}
                        style={{
                          width: 180,
                          height: 180,
                          borderRadius: 12,
                        }}
                      />
                    </View>
                    {Platform.OS === "web" && (
                      <a
                        href={qrCode}
                        download={`qr-beland-${Date.now()}.png`}
                        style={{
                          backgroundColor: "#f89d00",
                          padding: 8,
                          borderRadius: 8,
                          marginTop: 8,
                          display: "inline-flex",
                          alignItems: "center",
                          textDecoration: "none",
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "700" }}>
                          Descargar QR
                        </Text>
                      </a>
                    )}
                    <TouchableOpacity
                      onPress={handleResetQR}
                      className="mt-3 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full"
                    >
                      <Text className="text-sm text-gray-700 dark:text-gray-200">
                        Cerrar QR
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : null}

            {/* Texto de seguridad */}
            <View className="flex-row items-center justify-center gap-1.5 mt-4">
              <Ionicons name="shield-checkmark" size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-400">
                Transacción segura y encriptada
              </Text>
            </View>
          </View>
        </View>
        {/* Historial de cobros recientes - carrusel horizontal */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Historial de cobros recientes
          </Text>
          {loadingTransactions ? (
            <ActivityIndicator color="#007AFF" />
          ) : txItems && txItems.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
              className="gap-3"
            >
              {txItems.map((tx: any, idx: number) => {
                const { value: rawValue, unit } = extractAmount(tx);
                const parsed = parseFloat(
                  String(rawValue ?? "").replace(/,/g, ".")
                );
                const amtNum = !isNaN(parsed) ? parsed : undefined;
                const symbol = selectedCurrencyData?.symbol ?? "$";

                // Determine USD and BC representations
                let usdValue: number | undefined = undefined;
                let bcValue: number | undefined = undefined;
                const BECOIN_USD_RATE = 0.05; // 1 BC = $0.05

                if (unit === "BC") {
                  bcValue = amtNum;
                  usdValue =
                    amtNum !== undefined ? amtNum * BECOIN_USD_RATE : undefined;
                } else if (unit === "USD") {
                  usdValue = amtNum;
                  bcValue =
                    amtNum !== undefined
                      ? Math.floor((amtNum as number) / BECOIN_USD_RATE)
                      : undefined;
                } else {
                  // unknown: assume backend sent becoins (common in transactions)
                  if (amtNum !== undefined) {
                    // heuristic: if amtNum >= 1 and integer -> BC
                    if (amtNum >= 1 && Number.isInteger(amtNum)) {
                      bcValue = amtNum;
                      usdValue = amtNum * BECOIN_USD_RATE;
                    } else {
                      usdValue = amtNum;
                      bcValue = Math.floor(
                        (amtNum as number) / BECOIN_USD_RATE
                      );
                    }
                  }
                }

                const displayUSD =
                  usdValue !== undefined
                    ? typeof Intl !== "undefined"
                      ? Intl.NumberFormat(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(usdValue)
                      : usdValue.toFixed(2)
                    : rawValue != null
                    ? String(rawValue)
                    : "0.00";
                const displayBC = bcValue !== undefined ? String(bcValue) : "0";

                const date =
                  tx.created_at || tx.timestamp || tx.date || tx.createdAt;
                const msg =
                  tx.message ||
                  tx.resource_name ||
                  tx.concept ||
                  "Cobro recibido";
                const shortMsg =
                  String(msg).length > 30
                    ? String(msg).slice(0, 30) + "..."
                    : String(msg);
                const dateObj = date ? new Date(date) : null;
                const dateStr = dateObj ? dateObj.toLocaleDateString() : "";

                return (
                  <View
                    key={tx.id || idx}
                    style={{ width: 180 }}
                    className="mr-3"
                  >
                    <View className="bg-gray-50 dark:bg-gray-900/20 rounded-xl p-3 shadow-sm">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 rounded-full bg-white items-center justify-center ">
                            <Ionicons
                              name="cash-outline"
                              size={16}
                              color="#F59E0B"
                            />
                          </View>
                          <View>
                            <Text className="text-sm font-medium text-gray-900 dark:text-white">
                              {shortMsg}
                            </Text>
                            <Text
                              className="text-2xs text-gray-400"
                              style={{ fontSize: 11 }}
                            >
                              {dateStr}
                            </Text>
                            <Text
                              className="text-2xs text-gray-400 mt-1"
                              style={{ fontSize: 11 }}
                            >
                              {displayUSD} USD • {displayBC} BC
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <Text className="text-xs text-gray-500">
              No hay transacciones recientes.
            </Text>
          )}
        </View>

        {/* Información adicional */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                ¿Cómo funciona?
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                El código QR generado contiene la información del pago. El
                cliente puede escanearlo con su app de Beland y el monto se
                transferirá instantáneamente a tu cuenta.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
