/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,ts}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00E074",
        "primary-hover": "#00C968",
        "background-light": "#F8F9FB",
        "surface-light": "#FFFFFF",
        "text-main-light": "#111827",
        // Beland brand tokens (mapped from design-system)
        "beland-orange": {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F88D2A",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        "beland-green": {
          50: "#F0F9F0",
          100: "#DCEFDC",
          200: "#BBE1BB",
          300: "#8FCE8F",
          400: "#6BA43A",
          500: "#5A9234",
          600: "#4A7A2B",
          700: "#3B6322",
          800: "#2E4F1B",
          900: "#234015",
        },
        "beland-text": {
          primary: "#1F2937",
          secondary: "#6B7280",
          inverse: "#FFFFFF",
        },
        "beland-border": {
          DEFAULT: "#E5E7EB",
        },
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        glow: "0 0 15px rgba(0, 224, 116, 0.3)",
      },
    },
  },
  plugins: [],
};
