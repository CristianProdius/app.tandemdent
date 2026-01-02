import type { Config } from "tailwindcss";

const { fontFamily } = require("tailwindcss/defaultTheme");

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        gold: {
          "50": "#fbf8ec",
          "100": "#f6f0d4",
          "200": "#ede2a9",
          "300": "#e3d37e",
          "400": "#dac553",
          "500": "#d4af37",
          "600": "#b89229",
          "700": "#8b6e20",
          "800": "#5e4a16",
          "900": "#31250c",
          "950": "#1a1407",
        },
        teal: {
          "50": "#f0fdfa",
          "100": "#ccfbf1",
          "200": "#99f6e4",
          "300": "#5eead4",
          "400": "#2dd4bf",
          "500": "#14b8a6",
          "600": "#0d9488",
          "700": "#0f766e",
          "800": "#115e59",
          "900": "#134e4a",
          "950": "#042f2e",
        },
        green: {
          "500": "#14b8a6",
          "600": "#0d9488",
        },
        blue: {
          "500": "#79B5EC",
          "600": "#152432",
        },
        red: {
          "500": "#ef4444",
          "600": "#3E1716",
          "700": "#dc2626",
        },
        gray: {
          "50": "#f9fafb",
          "100": "#f3f4f6",
          "200": "#e5e7eb",
          "300": "#d1d5db",
          "400": "#9ca3af",
          "500": "#6b7280",
          "600": "#4b5563",
          "700": "#374151",
          "800": "#1f2937",
          "900": "#111827",
          "950": "#030712",
        },
        light: {
          "200": "#E8E9E9",
        },
        dark: {
          "200": "#0D0F10",
          "300": "#131619",
          "400": "#1A1D21",
          "500": "#363A3D",
          "600": "#76828D",
          "700": "#ABB8C4",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      backgroundImage: {
        appointments: "url('/assets/images/appointments-bg.png')",
        pending: "url('/assets/images/pending-bg.png')",
        cancelled: "url('/assets/images/cancelled-bg.png')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #d4af37 0%, #f6f0d4 50%, #d4af37 100%)",
        "premium-bg":
          "linear-gradient(135deg, #fdfbf7 0%, #fff 50%, #fef9e7 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.08)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.06)",
        "glass-lg": "0 16px 48px 0 rgba(0, 0, 0, 0.12)",
        "gold-glow": "0 0 20px rgba(212, 175, 55, 0.3)",
        "gold-glow-sm": "0 0 10px rgba(212, 175, 55, 0.2)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
