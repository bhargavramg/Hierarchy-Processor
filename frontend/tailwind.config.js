/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        line: "var(--line)",
        accent: "var(--accent)",
        "ok-bg": "#dcf0e3",
        "ok-text": "#2f7a4b",
        "warn-bg": "#fcecd0",
        "warn-text": "#b45309",
        "err-bg": "#fadcde",
        "err-text": "#a11f2c",
      },
      fontFamily: {
        serif: ['"Instrument Serif"', "serif"],
        sans: ['"Instrument Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        rise: 'rise 0.4s ease-out forwards',
      }
    },
  },
  plugins: [],
}
