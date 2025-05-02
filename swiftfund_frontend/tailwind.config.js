/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        '4xl': '2rem', // Add this
      },
      colors: {
        blue: {
          DEFAULT: '#1A73E8',
          dark: '#0056D2',
        },
        gray: {
          dark: '#2B2B2B',
          light: '#E8E8E8',
        },
        white: '#FFFFFF',
        gold: '#FFB300',
        green: {
          DEFAULT: '#22C55E',
        },
      },
      gradientColorStops: {
        blueGradient: {
          from: '#1A73E8',
          to: '#0056D2',
        },
        accentGradient: {
          from: '#22C55E',
          to: '#FFB300',
        },
      },
    },
  },
  plugins: [],
};