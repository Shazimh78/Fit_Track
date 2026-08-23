/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14151A",       // primary background
        panel: "#1D1F26",     // card surface
        panel2: "#262832",    // raised/hover surface
        line: "#33353F",      // hairline borders
        bone: "#F2F0EA",      // primary text
        mute: "#9B9DA8",      // secondary text
        volt: "#C6FF3D",      // primary action accent (kinetic lime)
        ember: "#FF5A3C",     // secondary accent (calories/heart-rate data)
        cobalt: "#4C8BF5",    // info/link accent
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
