/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Red Hat brand typefaces (wired in app/layout.tsx via next/font).
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-text)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          DEFAULT: "#ee0000", // Red Hat Red
          light: "#ff5c5c",
          red: "#ee0000",
          dark: "#cc0000",
          deep: "#a30000",
          tint: "#fff5f5",
        },
        ink: {
          DEFAULT: "#151515", // Red Hat near-black
          soft: "#3c3c43",
          muted: "#6e6e73",
        },
        canvas: "#f5f5f7", // Apple system gray
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -16px rgba(21,21,21,0.18)",
        lift: "0 10px 40px -12px rgba(21,21,21,0.22)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
