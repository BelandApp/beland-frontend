// Suppress noisy development logs (console.log/info/debug/warn) early on.
// Toggleable at runtime by setting `localStorage.SHOW_VERBOSE_LOGS = '1'` or 'true'.
// We keep `console.error` so real errors still surface.
// TODO ATER implement a babel remove console for logs
try {
  const shouldShow = (() => {
    try {
      // Always enable verbose logs in development builds (Expo/React Native)
      // __DEV__ is injected by Metro/Expo in dev mode
      // Also consider NODE_ENV === 'development' for web/node environments
      if (
        typeof (globalThis as any).__DEV__ !== "undefined" &&
        (globalThis as any).__DEV__
      ) {
        return true;
      }
      if (
        typeof process !== "undefined" &&
        process?.env &&
        process.env.NODE_ENV === "development"
      ) {
        return true;
      }

      // Check browser localStorage first (works on web)
      if (typeof window !== "undefined" && window?.localStorage) {
        const v = window.localStorage.getItem("SHOW_VERBOSE_LOGS");
        if (v === "1" || v === "true") return true;
      }

      // Fallback to environment variable if available (Metro bundler may inject some vars)
      if (
        typeof process !== "undefined" &&
        process?.env &&
        (process.env.SHOW_VERBOSE_LOGS === "1" ||
          process.env.SHOW_VERBOSE_LOGS === "true")
      ) {
        return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  })();

  if (!shouldShow) {
    // Replace noisy methods with no-ops
    const noop = () => {};
    // Keep original error for later if needed
    const originalConsole: any = (globalThis as any).console || {};
    originalConsole._original = originalConsole._original || {
      log: originalConsole.log,
      info: originalConsole.info,
      debug: originalConsole.debug,
      warn: originalConsole.warn,
      error: originalConsole.error,
    };

    // Override
    (globalThis as any).console = {
      ...originalConsole,
      log: noop,
      info: noop,
      debug: noop,
      warn: noop,
      // preserve error so real issues still appear
      error:
        originalConsole._original.error ||
        ((msg: any) => {
          /* fallback */
        }),
    };
  }
} catch (err) {
  // If anything goes wrong, don't block app startup
}

import { registerRootComponent } from "expo";

// Importar estilos globales web
import "./src/styles/global-web.css";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
