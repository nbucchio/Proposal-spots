/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#FBF6EF",
        ink: "#2C2130",
        wine: "#7C2F3B",
        wineDark: "#5E232B",
        sage: "#8E9A82",
        gold: "#C9A66B",
        line: "#E4D9C8",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
