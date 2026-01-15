/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bridgeBlue: {
          600: '#1e4fb8',
          700: '#173f93',
          800: '#102e6d',
        },
        bridgeTeal: {
          500: '#0ea5a5',
          600: '#0c8d8d',
        },
        bridgeGold: {
          500: '#d4af37',
          600: '#b8941c',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
