/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        hand: ["Kalam", "cursive"],
        body: ["Patrick Hand", "cursive"],
      },
      colors: {
        ink: "#2B2B2B",
        sun: "#F2B33D",
        sky: "#6FA8D8",
        mint: "#7FB88B",
        coral: "#E2725B",
        "purple-secondary": "#8C7CF0",
      },
      boxShadow: {
        sketch: "4px 4px 0 rgba(0,0,0,0.85)",
      },
    },
  },
  plugins: [],
};
