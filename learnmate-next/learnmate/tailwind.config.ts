/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core palette - keep existing tokens
        ink: "#090b12",
        panel: "#111522",
        surface: "#0d1020",
        card: "#141828",
        line: "#242a3b",
        "line-bright": "#2e3750",
        muted: "#9299ad",
        // Violet spectrum
        violet: { DEFAULT: "#9b8cff", dim: "#6d5ce8", bright: "#c4b5fd", glow: "rgba(139,92,246,0.15)" },
        // Accent
        mint: { DEFAULT: "#74e5c2", dim: "#34d399" },
        amber: { DEFAULT: "#fbbf24", dim: "#f59e0b" },
        rose: { DEFAULT: "#fb7185", dim: "#f43f5e" },
        sky: { DEFAULT: "#38bdf8", dim: "#0ea5e9" },
      },
      fontFamily: {
        sans: ["Inter var", "Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 40px rgba(139,92,246,0.15)",
        "glow-sm": "0 0 20px rgba(139,92,246,0.1)",
        "glow-lg": "0 0 80px rgba(139,92,246,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)",
        modal: "0 8px 48px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(105,79,208,0.25), transparent 65%)",
        "card-gradient": "linear-gradient(145deg, rgba(17,21,34,0.9), rgba(9,11,18,0.95))",
        "violet-gradient": "linear-gradient(110deg, #8b5cf6, #6d5ce8)",
        "mint-gradient": "linear-gradient(110deg, #34d399, #0d9488)",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease both",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in-right": "slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in": "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.8s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow": "spin 3s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { from: { opacity: "0", transform: "translateX(-12px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.94)" }, to: { opacity: "1", transform: "scale(1)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        float: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
