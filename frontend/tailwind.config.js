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
        background: "#0E0F12",       // Raycast deep matte charcoal
        sidebar: "#141518",          // Raycast sidebar neutral
        surface: "#1A1B20",          // Raycast card surface
        surfaceHover: "#23252B",     // Raycast hover pill
        surfaceActive: "#2C2E36",    // Raycast active selector
        border: "#282A33",           // Raycast subtle divider
        accent: {
          theme: "var(--accent-primary)",
          themeGlow: "var(--accent-glow)",
          themeBorder: "var(--accent-border)",
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
        sans: ['"Segoe UI Variable Display"', '"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
