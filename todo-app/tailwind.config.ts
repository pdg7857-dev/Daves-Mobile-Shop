import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d12",
        panel: "#141821",
        muted: "#1c2230",
        line: "#252b3a",
        ink: "#e8ecf3",
        sub: "#9aa3b2",
        accent: "#5ee0b0",
        warn: "#f5b54c",
        danger: "#f17c7c",
      },
    },
  },
  plugins: [],
};

export default config;
