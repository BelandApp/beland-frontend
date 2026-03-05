import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { useCustomNavigation } from "src/hooks";
import { useCanjear } from "./hooks/useCanjear";
import { CustomLoader, ThemedHeader } from "src/components";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BeCoinIcon } from "src/components/icons/BeCoinIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import { convertUSDToBeCoins } from "src/constants";
import { useAuth } from "src/context";

const CanjearScreen = () => {
  const { goBack, navigate } = useCustomNavigation();
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("MainTabs", { screen: "Wallet" });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <CustomLoader />;
  }
  const {
    // Estados
    amount,
    amountUSD,
    amountBC,
    isLoading,
    selectedWithdrawAccount,
    withdrawAccounts,
    loadingAccounts,
    showAccountSelector,
    balance,
    balanceUSD,
    locked_balance,

    // Valores calculados
    isAmountValid,
    canContinue,

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
  } = useCanjear();

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
        <ThemedHeader title="Canjear" onBackPress={() => goBack()} canGoBack />
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

      <ThemedHeader title="Canjear" onBackPress={() => goBack()} canGoBack />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6 pb-24">
          <View className="flex-row gap-6 flex-wrap">
            {/* Left column: form */}
            <View className="flex-1 min-w-[260px]">
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
                  } flex-row items-center px-4 py-3`}
                >
                  <View className="mr-3">
                    <BeCoinIcon width={20} height={20} />
                  </View>

                  <TextInput
                    className="flex-1 text-lg font-semibold text-gray-900 dark:text-white"
                    placeholder="0.00"
                    value={amount}
                    onChangeText={handleAmountChange}
                    keyboardType="numeric"
                    maxLength={10}
                    placeholderTextColor="#9CA3AF"
                  />

                  <TouchableOpacity
                    onPress={() => setPresetAmount(balanceUSD)}
                    className="ml-3"
                  >
                    <Text className="text-yellow-500 font-bold">MAX</Text>
                  </TouchableOpacity>
                </View>

                {!isAmountValid && amount !== "" && (
                  <Text className="text-sm text-red-500 mt-2">
                    {isAmountValid
                      ? "No tienes suficientes USD"
                      : "Ingresa un monto válido"}
                  </Text>
                )}

                {amount && isAmountValid && (
                  <Text className="text-sm text-green-600 font-medium mt-2">
                    {amountBC} BeCoins
                  </Text>
                )}
              </View>

              {/* Preset Amounts */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Montos rápidos en USD
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[1, 2, 5, 10, balanceUSD].map(
                    (preset, index) =>
                      preset > 0 && (
                        <TouchableOpacity
                          key={index}
                          className={`px-4 py-2 rounded-full border ${
                            amountUSD === preset
                              ? "bg-[#F58220] border-[#F58220]"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          }`}
                          onPress={() => setPresetAmount(preset)}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              amountUSD === preset
                                ? "text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {preset === balance
                              ? "Todo"
                              : `$ ${preset.toLocaleString()}`}
                          </Text>
                        </TouchableOpacity>
                      ),
                  )}
                </View>
              </View>

              {/* Account Selection */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Cuentas de Retiro
                </Text>

                <View className="space-y-3">
                  {withdrawAccounts.map((acct) => {
                    const selected = selectedWithdrawAccount?.id === acct.id;
                    return (
                      <TouchableOpacity
                        key={acct.id}
                        onPress={() => handleSelectAccount(acct)}
                        className={`flex-row items-center justify-between p-4 rounded-xl border ${
                          selected
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 bg-white dark:bg-gray-800"
                        }`}
                      >
                        <View className="flex-row items-center flex-1">
                          <View className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-lg items-center justify-center mr-3">
                            {acct.withdraw_account_type?.code === "WALLET" ? (
                              <BeCoinIcon width={18} height={18} />
                            ) : (
                              <MaterialCommunityIcons
                                name="bank"
                                size={18}
                                color="#9CA3AF"
                              />
                            )}
                          </View>

                          <View className="flex-1">
                            {(() => {
                              const bankLabel =
                                (acct as any).bank_name ||
                                acct.provider ||
                                acct.alias ||
                                acct.owner_name ||
                                "";
                              const cbuSuffix = acct.cbu
                                ? ` **** ${acct.cbu.slice(-4)}`
                                : "";
                              const title = bankLabel
                                ? `${bankLabel}${cbuSuffix}`
                                : getAccountTitle(acct);
                              const subtitle = acct.withdraw_account_type?.name
                                ? `${acct.withdraw_account_type.name} · ${acct.currency}`
                                : `${
                                    acct.provider ||
                                    acct.withdraw_account_type?.name ||
                                    "Cuenta"
                                  } · USD`;

                              return (
                                <>
                                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                                    {title}
                                  </Text>
                                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                                    {subtitle}
                                  </Text>
                                </>
                              );
                            })()}
                          </View>
                        </View>

                        <View className="items-end">
                          {acct.is_active && (
                            <View className="bg-green-50 border border-green-200 px-2 py-1 rounded-full mb-1">
                              <Text className="text-xs text-green-700 font-semibold">
                                Verificada
                              </Text>
                            </View>
                          )}
                          {selected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color="#10B981"
                            />
                          ) : (
                            <Ionicons
                              name="ellipse"
                              size={14}
                              color="#E5E7EB"
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Info Banner */}
              <View className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
                <View className="flex-row">
                  <Text className="text-blue-400 text-xl mr-3">ℹ️</Text>
                  <Text className="text-sm text-blue-700 dark:text-blue-300 flex-1">
                    Los retiros suelen procesarse en un plazo de 24 a 48 horas
                    hábiles. Asegúrate de que los datos de tu cuenta bancaria
                    sean correctos para evitar rechazos.
                  </Text>
                </View>
              </View>
            </View>

            {/* Right column: summary */}
            <View style={{ width: 360 }} className="flex-col">
              {/* Balance Card */}
              <View className="bg-gray-50 dark:bg-[#1F2937] rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <Text className="text-sm text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Disponible
                </Text>
                <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                  {`$${formatUSDPrice(convertBeCoinsToUSD(balance))} USD`}
                </Text>
                <View className="flex-row items-baseline mb-2">
                  <View className="w-8 h-8 rounded-full bg-yellow-400 items-center justify-center mr-2">
                    <BeCoinIcon width={18} height={18} />
                  </View>
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {balance.toLocaleString()} BeCoins
                  </Text>
                </View>
                {locked_balance > 0 && (
                  <Text className="text-xs text-gray-400 dark:text-gray-500 italic">
                    {locked_balance.toLocaleString()} BC bloqueados
                  </Text>
                )}
              </View>

              {/* Summary Card */}
              <View className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-md">
                <View className="gap-3">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600 dark:text-gray-400">
                      Monto a canjear
                    </Text>
                    <Text className="font-medium text-gray-900 dark:text-white">
                      $ {amount.toLocaleString()} USD
                    </Text>
                  </View>
                  {/* tasa y comisión removidas según diseño */}
                  <View className="flex-row justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Text className="font-bold text-gray-900 dark:text-white">
                      Total a recibir
                    </Text>
                    <Text className="font-bold text-green-600">
                      {convertUSDToBeCoins(Number(amount))} BC
                    </Text>
                  </View>
                </View>

                {/* Action Buttons (full width) */}
                <TouchableOpacity
                  className={`mt-6 rounded-xl py-4 flex-row items-center justify-center ${
                    canContinue
                      ? "bg-[#F58220]"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                  onPress={handleBuy}
                  disabled={!canContinue || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Confirmar Canje{amount && ` ${amount} USD`}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="mt-3 bg-white dark:bg-gray-800 rounded-xl py-3 border border-gray-200 dark:border-gray-600"
                  onPress={() => goBack()}
                >
                  <Text className="text-gray-700 dark:text-gray-300 font-medium text-center">
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
              renderItem={({ item }) => {
                const selected = selectedWithdrawAccount?.id === item.id;
                return (
                  <TouchableOpacity
                    className={`p-4 border-b border-gray-100 dark:border-gray-800 ${
                      selected ? "bg-green-50 dark:bg-green-900/20" : ""
                    }`}
                    onPress={() => handleSelectAccount(item)}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name={selected ? "radio-button-on" : "radio-button-off"}
                        size={22}
                        color={selected ? "#F58220" : "#9CA3AF"}
                      />

                      <View className="flex-1 ml-3">
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

                      <View className="items-end ml-3">
                        {item.is_active && (
                          <View className="bg-green-50 border border-green-200 px-2 py-1 rounded-full mb-1">
                            <Text className="text-xs text-green-700 font-semibold">
                              Verificada
                            </Text>
                          </View>
                        )}
                        <MaterialCommunityIcons
                          name="bank"
                          size={18}
                          color="#9CA3AF"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CanjearScreen;
