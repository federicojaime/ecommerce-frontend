/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        secondary: {
          500: '#eddacb',
        },
        // Sobrescribir los colores amber
        amber: {
          50: '#fefcf7',
          100: '#fdf4e7',
          200: '#f9e5c3',
          300: '#f5d5a0',
          400: '#eddacb',  // Tu color principal
          500: '#eddacb',  // Tu color principal
          600: '#d4c4b0',
          700: '#baac95',
          800: '#a0967a',
        }
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}