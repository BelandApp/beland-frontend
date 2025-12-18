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
  Modal,
  FlatList,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCanjear } from "./hooks/useCanjear";

interface CanjearScreenProps {
  navigation: any;
  route?: any;
  balance?: number;
}

const CanjearScreen: React.FC<CanjearScreenProps> = ({ navigation }) => {
  const {
    // Estados
    amount,
    isLoading,
    selectedWithdrawAccount,
    withdrawAccounts,
    loadingAccounts,
    showAccountSelector,
    balance,
    locked_balance,

    // Valores calculados
    parsedAmount,
    isAmountValid,
    canContinue,
    amounts,

    // Funciones de formato
    getAccountDisplayName,
    getAccountTitle,

    // Handlers
    handleAmountChange,
    handleBuy,
    handleAddAccount,
    handleSelectAccount,
    setShowAccountSelector,
    setPresetAmount,

    // Utilidades
    formatUSDPrice,
    convertBeCoinsToUSD,
  } = useCanjear(navigation);

  // Estados de carga
  if (loadingAccounts) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 dark:bg-[#0B1120]">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F58220" />
          <Text className="mt-3 text-base text-gray-600 dark:text-gray-400">
            Cargando cuentas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Estado vacío - sin cuentas
  if (withdrawAccounts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 dark:bg-[#0B1120]">
        <View className="flex-1 justify-center items-center px-8">
          <MaterialCommunityIcons
            name="bank-off"
            size={64}
            color="#9CA3AF"
            style={{ marginBottom: 16 }}
          />
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            No tienes cuentas de retiro
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 text-center leading-5 mb-6">
            Para canjear tus BeCoins por dinero real, primero necesitas agregar
            una cuenta bancaria o método de pago.
          </Text>
          <TouchableOpacity
            className="bg-[#F58220] px-6 py-3 rounded-xl"
            onPress={handleAddAccount}
          >
            <Text className="text-white text-base font-semibold">
              Agregar cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Vista principal
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0B1120]">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="bg-[#F58220] px-4 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            className="p-2 rounded-full active:bg-white/20"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Canjear</Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 rounded-full bg-green-700 items-center justify-center border-2 border-white">
            <Text className="text-white font-bold">G</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6 pb-24">
          {/* Balance Card */}
          <View className="bg-gray-50 dark:bg-[#1F2937] rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 items-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400 uppercase mb-2">
              Disponible
            </Text>
            <View className="flex-row items-baseline mb-2">
              <View className="w-8 h-8 rounded-full bg-yellow-400 items-center justify-center mr-2">
                <Text className="text-yellow-900 font-bold text-xs">BC</Text>
              </View>
              <Text className="text-4xl font-bold text-gray-900 dark:text-white">
                {balance.toLocaleString()}
              </Text>
            </View>
            <Text className="text-base text-gray-600 dark:text-gray-400 mb-4">
              ≈ ${formatUSDPrice(convertBeCoinsToUSD(balance))} USD Total
              estimado
            </Text>

            {locked_balance > 0 && (
              <View className="pt-4 border-t border-gray-200 dark:border-gray-700 w-full items-center">
                <Text className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                  Balance bloqueado
                </Text>
                <Text className="text-base font-semibold text-gray-400 dark:text-gray-500 italic">
                  {locked_balance.toLocaleString()} BC
                </Text>
              </View>
            )}
          </View>

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Cantidad a canjear
            </Text>
            <View
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${
                !isAmountValid && amount !== ""
                  ? "border-red-500"
                  : "border-gray-200 dark:border-gray-700"
              } flex-row items-center px-4 py-4`}
            >
              <Text className="text-yellow-500 font-bold mr-3">BC</Text>
              <TextInput
                className="flex-1 text-lg font-semibold text-gray-900 dark:text-white"
                placeholder="0.00"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#9CA3AF"
              />
              <Text className="text-gray-400 text-sm">MAX</Text>
            </View>

            {!isAmountValid && amount !== "" && (
              <Text className="text-sm text-red-500 mt-2">
                {parsedAmount > balance
                  ? "No tienes suficientes BeCoins"
                  : "Ingresa un monto válido"}
              </Text>
            )}

            {amount && isAmountValid && (
              <Text className="text-sm text-green-600 font-medium mt-2">
                ≈ ${formatUSDPrice(convertBeCoinsToUSD(parsedAmount))} USD
              </Text>
            )}
          </View>

          {/* Preset Amounts */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Montos rápidos
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[100, 200, 500, 1000, balance].map(
                (preset, index) =>
                  preset > 0 && (
                    <TouchableOpacity
                      key={index}
                      className={`px-4 py-2 rounded-full border ${
                        parsedAmount === preset
                          ? "bg-[#F58220] border-[#F58220]"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      }`}
                      onPress={() => setPresetAmount(preset)}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          parsedAmount === preset
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {preset === balance ? "Todo" : preset.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  )
              )}
            </View>
          </View>

          {/* Account Selection */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Cuenta de destino
            </Text>

            {selectedWithdrawAccount ? (
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20"
                onPress={() => setShowAccountSelector(true)}
              >
                <View className="flex-1">
                  <View className="mb-1">
                    <Text className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                      {selectedWithdrawAccount.withdraw_account_type?.name ||
                        ""}
                    </Text>
                  </View>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {getAccountTitle(selectedWithdrawAccount)}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {getAccountDisplayName(selectedWithdrawAccount)}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={24} color="#6B7280" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="items-center p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
                onPress={() => setShowAccountSelector(true)}
              >
                <MaterialCommunityIcons
                  name="bank-plus"
                  size={32}
                  color="#9CA3AF"
                />
                <Text className="text-base font-semibold text-gray-700 dark:text-gray-300 mt-2 text-center">
                  Seleccionar cuenta
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Elige dónde recibir tu dinero
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Info Banner */}
          <View className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
            <View className="flex-row">
              <Text className="text-blue-400 text-xl mr-3">ℹ️</Text>
              <Text className="text-sm text-blue-700 dark:text-blue-300 flex-1">
                Los retiros suelen procesarse en un plazo de 24 a 48 horas
                hábiles. Asegúrate de que los datos de tu cuenta bancaria sean
                correctos para evitar rechazos.
              </Text>
            </View>
          </View>

          {/* Summary Card */}
          <View className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <View className="pt-4 border-t border-gray-100 dark:border-gray-700 gap-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-gray-400">
                  Monto a canjear
                </Text>
                <Text className="font-medium text-gray-900 dark:text-white">
                  {parsedAmount.toLocaleString()} BC
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-gray-400">
                  Tasa de cambio
                </Text>
                <Text className="font-medium text-gray-900 dark:text-white">
                  $0.05 / BC
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-gray-400">
                  Comisión de servicio (1%)
                </Text>
                <Text className="font-medium text-red-500">
                  -${amounts.fee}
                </Text>
              </View>
              <View className="flex-row justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <Text className="font-bold text-gray-900 dark:text-white">
                  Total a recibir
                </Text>
                <Text className="font-bold text-green-600">
                  ${amounts.net} USD
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              className={`mt-6 rounded-xl py-3 flex-row items-center justify-center ${
                canContinue ? "bg-[#F58220]" : "bg-gray-300 dark:bg-gray-700"
              }`}
              onPress={handleBuy}
              disabled={!canContinue || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text className="text-xl mr-2">💱</Text>
                  <Text className="text-white font-bold">
                    Confirmar Canje
                    {amount && ` ${amount} BeCoins`}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 bg-white dark:bg-gray-800 rounded-xl py-3 border border-gray-200 dark:border-gray-600"
              onPress={() => navigation.goBack()}
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium text-center">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Security Badge */}
          <View className="flex-row items-center justify-center">
            <Text className="text-gray-400 text-base mr-2">🔒</Text>
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              Transacción encriptada y segura de extremo a extremo.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Account Selector Modal */}
      <Modal
        visible={showAccountSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAccountSelector(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-[#1F2937] rounded-t-3xl max-h-[80%]">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Seleccionar cuenta
              </Text>
              <TouchableOpacity onPress={() => setShowAccountSelector(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={withdrawAccounts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 ${
                    selectedWithdrawAccount?.id === item.id
                      ? "bg-green-50 dark:bg-green-900/20"
                      : ""
                  }`}
                  onPress={() => handleSelectAccount(item)}
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {getAccountTitle(item)}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400 mb-0.5">
                      {getAccountDisplayName(item)}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500 uppercase">
                      {item.withdraw_account_type?.name || ""}
                    </Text>
                  </View>
                  {selectedWithdrawAccount?.id === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10B981"
                    />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View className="bg-white dark:bg-[#1F2937] border-t border-gray-200 dark:border-gray-800">
        <View className="flex-row justify-between items-center h-16 px-4">
          {[
            { icon: "home", label: "Home" },
            { icon: "wallet", label: "Wallet", active: true },
            { icon: "document-text", label: "Catálogo" },
            { icon: "people", label: "Eventos" },
            { icon: "storefront", label: "Grupos" },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              className="flex-1 items-center active:opacity-70"
            >
              {item.active && (
                <View className="absolute -top-1 w-12 h-1 bg-[#F58220] rounded-b-full" />
              )}
              <Ionicons
                name={item.icon as any}
                size={24}
                color={item.active ? "#F58220" : "#9CA3AF"}
              />
              <Text
                className={`text-[10px] mt-1 ${
                  item.active ? "text-[#F58220] font-medium" : "text-gray-500"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CanjearScreen;
