/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        goldrasz: {
          white: "#FFFFFF",
          bg: "#fff56a",
          lightGray: "#F1F3F7",
          border: "#E2E8F0",
          textDark: "#1E293B",
          gold: "#D4AF37",
          goldHover: "#AA8C2C",
          goldLight: "rgba(212, 175, 55, 0.08)",
        }
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(212, 175, 55, 0.15)',
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}