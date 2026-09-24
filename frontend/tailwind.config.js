export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--bg-canvas)",
        sidebar: "var(--bg-sidebar)",
        surface: "var(--bg-card)",
        surfaceHover: "var(--bg-card-hover)",
        surfaceSubtle: "var(--bg-card-subtle)",
        border: "var(--border-subtle)",
        borderFocus: "var(--border-focus)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textTertiary: "var(--text-tertiary)",
        accent: {
          theme: "var(--accent-primary)",
          themeGlow: "transparent",
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI Variable Display"', '"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
