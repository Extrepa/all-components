/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        oil: { 900: "#050714", 800: "#0b1026" },
        neon: { cyan: "#00ffff", magenta: "#ff00ff" },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'errl-gradient': 'linear-gradient(135deg, #00ffff 0%, #bd00ff 100%)',
      }
    },
  },
  plugins: [],
}