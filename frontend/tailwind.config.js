/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        highlight: "#ffeb3b",
        "planning-bg": "#d0bfff",
        "retrieve-bg": "#a5d8ff",
        "generate-bg": "#b2f2bb",
        "evaluate-bg": "#ffec99",
        "refine-bg": "#ffc9c9",
      },
      animation: {
        highlight: "highlight 0.6s ease-in-out",
        slide: "slide 0.4s ease-in-out",
      },
      keyframes: {
        highlight: {
          "0%": { opacity: "0.5" },
          "50%": { opacity: "1" },
          "100%": { opacity: "1" },
        },
        slide: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
