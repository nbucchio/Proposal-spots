/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Matches the live site's exact CSS variables (see spot.html /
        // index.html :root) — --bg, --ink, --accent, --muted, --hairline.
        parchment: "#F4F1EB",
        ink: "#1C1C1C",
        wine: "#8C7B64",
        sage: "#9E9890",
        line: "#D8D2C8",
      },
      fontFamily: {
        display: ["Cormorant", "serif"],
        body: ["Jost", "sans-serif"],
      },
    },
  },
  plugins: [],
};
