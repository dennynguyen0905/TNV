import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        blue: {
          50: "#EEF2FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          800: "#1E3A8A",
        },
        green: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#059669",
          600: "#047857",
        },
        amber: {
          50: "#FFFBEB",
          400: "#F59E0B",
          500: "#D97706",
          600: "#B45309",
        },
        red: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#DC2626",
          600: "#B91C1C",
        },
        n: {
          0: "#FFFFFF",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      borderRadius: {
        btn: "10px",
        card: "16px",
        lg: "24px",
        input: "10px",
        badge: "999px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)",
        hover: "0 4px 12px rgba(15,23,42,0.08), 0 12px 32px rgba(15,23,42,0.1)",
        modal: "0 24px 64px rgba(15,23,42,0.18)",
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
