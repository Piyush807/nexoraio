/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: { 950: "#0B0E14", 900: "#12161F", 800: "#171C28", 700: "#232838", 600: "#323A4E" },
        ink: { 100: "#E9ECF3", 300: "#B7BECD", 500: "#8891A6", 700: "#5B6578" },
        signal: { violet: "#22D3EE", violetSoft: "#67E8F9", mint: "#3DDC97", amber: "#F0B429", rose: "#F0556B" },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: { "grid-fade": "linear-gradient(to bottom, rgba(34,211,238,0.08), transparent 60%)" },
      boxShadow: { glow: "0 0 0 1px rgba(34,211,238,0.18), 0 12px 36px -12px rgba(34,211,238,0.28)" },
      keyframes: {
        dash: { to: { strokeDashoffset: "0" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.5" } },
      },
      animation: {
        dash: "dash 1.4s ease-out forwards",
        fadeUp: "fadeUp 0.5s ease-out both",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
