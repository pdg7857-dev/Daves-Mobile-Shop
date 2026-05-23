import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sf)",
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          "Inter",
          "system-ui",
          '"Segoe UI"',
          "Roboto",
          "sans-serif"
        ]
      },
      letterSpacing: {
        tightest: "-0.035em",
        tighter: "-0.022em",
        tight: "-0.011em"
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a"
        },
        apple: {
          blue: "#0071e3",
          blueHover: "#0077ed",
          ink: "#1d1d1f",
          paper: "#f5f5f7",
          divider: "#d2d2d7",
          subtext: "#86868b"
        },
        accent: {
          500: "#f59e0b",
          600: "#d97706"
        }
      },
      fontSize: {
        "display-2xl": ["clamp(48px, 8vw, 96px)", { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "600" }],
        "display-xl": ["clamp(40px, 6vw, 72px)", { lineHeight: "1.05", letterSpacing: "-0.022em", fontWeight: "600" }],
        "display-lg": ["clamp(32px, 4.5vw, 56px)", { lineHeight: "1.07", letterSpacing: "-0.018em", fontWeight: "600" }],
        "display-md": ["clamp(24px, 3.5vw, 40px)", { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "600" }],
        "eyebrow": ["13px", { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "600" }]
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.2, 0.65, 0.3, 1) both"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
