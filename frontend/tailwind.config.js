/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#0B0E14",
        sidebar: "#11151F",
        surface: "#161B26",
        surfaceHover: "#1F2637",
        surfaceActive: "#262F44",
        border: "#232B3E",
        accent: {
          lime: "#D4F63D",
          blue: "#38BDF8",
          purple: "#C084FC",
          cyan: "#22D3EE",
          green: "#22C55E",
          orange: "#FB923C",
          red: "#F87171"
        }
      },
      fontFamily: {
        sans: ['"Segoe UI Variable Display"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
