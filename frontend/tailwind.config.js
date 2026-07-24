/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#0D9488",
          hover: "#0B7A70",
          tint: "#E6F4F1",
        },
        surface: {
          0: "oklch(97% 0.006 250)",
          1: "oklch(99.5% 0.003 250)",
          2: "#ffffff",
        },
        border: {
          DEFAULT: "oklch(90% 0.01 255)",
          soft: "oklch(92% 0.008 255)",
          subtle: "oklch(94% 0.006 255)",
        },
        text: {
          primary: "oklch(24% 0.02 255)",
          secondary: "oklch(50% 0.02 255)",
          muted: "oklch(55% 0.02 255)",
        },
        diff: {
          removed: "oklch(95% 0.045 25)",
          added: "oklch(95% 0.045 150)",
        },
      },
      borderRadius: {
        card: "16px",
        input: "9px",
        btn: "10px",
        badge: "100px",
      },
      fontSize: {
        "2xs": "12px",
        xs: "12.5px",
        sm: "13px",
        base: "14px",
        lg: "15px",
        xl: "20px",
        "2xl": "26px",
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
    },
  },
  plugins: [],
}
