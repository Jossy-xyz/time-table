module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brick: {
          DEFAULT: "#b8846f",
          deep: "#a67660",
          dark: "#8a5b47",
        },
        gold: {
          DEFAULT: "#ffd36b",
          deep: "#ffb800",
        },
        "status-info": "#0b5fa5",
        "status-success": "#1e7f3b",
        "status-warning": "#cc9a22",
        "status-error": "#a84444",
        surface: "var(--bg-card)",
        page: "var(--bg-main)",
        "bg-input": "var(--bg-input)",
        "institutional-primary": "var(--text-primary)",
        "institutional-secondary": "var(--text-secondary)",
        "institutional-muted": "var(--text-muted)",
      },
      borderRadius: {
        institutional: "8px",
      },
    },
  },
  plugins: [],
};
