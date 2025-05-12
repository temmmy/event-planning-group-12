/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TS files in src
  ],
  theme: {
    extend: {
      colors: {
        // Nord Theme Colors
        // Polar Night
        nord0: "#2E3440",
        nord1: "#3B4252",
        nord2: "#434C5E",
        nord3: "#4C566A",
        // Snow Storm
        nord4: "#D8DEE9",
        nord5: "#E5E9F0",
        nord6: "#ECEFF4",
        // Frost
        nord7: "#8FBCBB",
        nord8: "#88C0D0",
        nord9: "#81A1C1",
        nord10: "#5E81AC",
        // Aurora
        nord11: "#BF616A", // Red
        nord12: "#D08770", // Orange
        nord13: "#EBCB8B", // Yellow
        nord14: "#A3BE8C", // Green
        nord15: "#B48EAD", // Purple
      },
      fontFamily: {
        urbanist: ["Urbanist", "sans-serif"],
        garamond: ["EB Garamond", "serif"],
      },
      boxShadow: {
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        card: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        button:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        nav: "0 2px 4px rgba(0, 0, 0, 0.04)",
        soft: "0 5px 15px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
