/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#07090E",
        surface: "#0D111A",
        "surface-elevated": "#131926",
        "surface-hover": "#1A2336",
        "brand-emerald": "#10B981",
        "brand-cyan": "#06B6D4",
        "brand-indigo": "#6366F1",
        "brand-amber": "#F59E0B",
        "brand-rose": "#F43F5E",
      },
    },
  },
  plugins: [],
};
