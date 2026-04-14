/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a8ba',
          400: '#ec7096',
          500: '#e04577',
          600: '#c9265a',
          700: '#a91a4a',
          800: '#8c1941',
          900: '#660033',
          950: '#4a0025',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
