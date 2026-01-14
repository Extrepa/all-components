/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'errl-void': '#050505',
        'errl-cyan': '#00ffff',
        'errl-magenta': '#ff00ff',
        'errl-lime': '#ccff00',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      dropShadow: {
        'neon-cyan': '0 0 5px rgba(0, 255, 255, 0.8)',
        'neon-magenta': '0 0 5px rgba(255, 0, 255, 0.8)',
      },
      animation: {
        'snake-text': 'snake-text 3s linear infinite',
      },
      keyframes: {
        'snake-text': {
          '0%, 100%': { color: '#00ffff', textShadow: '0 0 10px #00ffff' },
          '50%': { color: '#ff00ff', textShadow: '0 0 10px #ff00ff' },
        }
      }
    },
  },
  plugins: [],
}