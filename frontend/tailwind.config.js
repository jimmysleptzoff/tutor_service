/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe7ff",
          300: "#98b3ff",
          500: "#5f7cff",
          700: "#2d46b8",
          900: "#0b1232",
        },
      },
      boxShadow: {
        glow: "0 18px 40px -14px rgba(95,124,255,0.55)",
      },
    },
  },
  plugins: [],
}

