/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-dark": "var(--color-primary-dark)",
        "text-muted": "var(--color-text-muted)",
        "bg-purple": "var(--color-bg-purple)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        londrina: ["Londrina Solid", "cursive"],
        baloo: ["Baloo Bhai 2", "cursive"],
      },
      borderWidth: {
        6: "6px",
      },
    },
  },
  plugins: [],
};
