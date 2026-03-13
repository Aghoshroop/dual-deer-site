import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#FFFFFF",
        secondary: "#0A0A0A",
        charcoal: "#0A0A0A",
        accent: {
          blue: "#0057FF",
          cyan: "#00E5FF",
          violet: "#6A00FF",
          "violet-electric": "#9D4DFF",
          "violet-lavender": "#C084FF",
          neon: "#00E5FF",
        },
        violet: {
          900: "#3b0764",
          800: "#5b21b6",
          700: "#6d28d9",
          600: "#7c3aed",
          500: "#8b5cf6",
          400: "#a78bfa",
          300: "#c4b5fd",
        }
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "sans-serif"],
        display: ["Neue Haas Grotesk", "Inter", "sans-serif"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "slide-in": "slide-in 0.5s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
