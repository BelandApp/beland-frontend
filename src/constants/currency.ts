export const CURRENCY_CONFIG = {
  // Configuración de moneda
  CURRENCY_SYMBOL: "USD",
  CURRENCY_DISPLAY_SYMBOL: "$",

  // Factor de conversión de pesos argentinos a dólares (aproximado)
  // 1 USD = ~350 ARS (puedes ajustar este valor según el tipo de cambio actual)
  PESO_TO_USD_RATE: 350,

  // Formateo de números
  DECIMAL_PLACES: 2,
  USE_THOUSANDS_SEPARATOR: true,
} as const;

/**
 * Convierte un precio de pesos argentinos a dólares
 */
export const convertPesoToUSD = (pesoAmount: number): number => {
  return (
    Math.round((pesoAmount / CURRENCY_CONFIG.PESO_TO_USD_RATE) * 100) / 100
  );
};

/**
 * Formatea un precio en dólares para mostrar
 */
export const formatUSDPrice = (amount: number | string): string => {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    console.warn("formatUSDPrice: Invalid amount received:", amount);
    return "$0.00";
  }

  const formattedAmount = numericAmount.toFixed(CURRENCY_CONFIG.DECIMAL_PLACES);

  if (CURRENCY_CONFIG.USE_THOUSANDS_SEPARATOR) {
    return formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return formattedAmount;
};

/**
 * Convierte y formatea un precio de pesos a dólares
 */
export const convertAndFormatPrice = (pesoAmount: number): string => {
  const usdAmount = convertPesoToUSD(pesoAmount);
  return formatUSDPrice(usdAmount);
};

// Configuración de BeCoins
export const BECOIN_CONFIG = {
  VALUE_USD: 0.05, // 5 centavos por BeCoin
  INITIAL_BALANCE: 300,
  SYMBOL: "🪙",
  NAME: "BeCoins",
} as const;

/**
 * Formatea una cantidad de BeCoins
 */
export const formatBeCoins = (amount: number): string => {
  return `${amount} BeCoins`;
};

/**
 * Formatea BeCoins mostrando su valor en USD
 */
export const formatBeCoinsWithValue = (amount: number): string => {
  const usdValue = amount * BECOIN_CONFIG.VALUE_USD;
  return `${amount} BeCoins (${
    CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL
  }${formatUSDPrice(usdValue)})`;
};

/**
 * Convierte un monto en USD a BeCoins necesarios
 */
export const convertUSDToBeCoins = (usdAmount: number): number => {
  return Math.ceil(usdAmount / BECOIN_CONFIG.VALUE_USD);
};

/**
 * Convierte BeCoins a su valor en USD
 */
export const convertBeCoinsToUSD = (beCoins: number): number => {
  return beCoins * BECOIN_CONFIG.VALUE_USD;
};
