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
        background: "#121212",
        surface: "#1E1E1E",
        surfaceHover: "#282828",
        border: "#333333",
        accent: {
          blue: "#38bdf8",
          green: "#4ade80",
          purple: "#c084fc",
          cyan: "#22d3ee",
          orange: "#fb923c",
          red: "#f87171"
        }
      },
      fontFamily: {
        sans: ['"Segoe UI Variable Display"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
