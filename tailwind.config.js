/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6fa',
          100: '#dceaf5',
          200: '#bfd9eb',
          300: '#94bfdc',
          400: '#639ec9',
          500: '#4182b2',
          600: '#306894',
          700: '#275378',
          800: '#234663',
          900: '#003a6c', // Logo color
          950: '#0e263d',
        },
        navy: {
          800: '#0f172a',
          900: '#090d16',
          950: '#05070c'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
