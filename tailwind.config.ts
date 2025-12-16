import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F4C5C", // Deep Teal
        secondary: {
          DEFAULT: "#FFC107", // Sunrise Yellow
          foreground: "#000000",
        },
        success: "#10B981", // Emerald Green
        error: "#EF4444", // Alert Red
        background: "#F8FAFC", // Off-White
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
    },
  },
  plugins: [],
};
export default config;
