/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#fdf8f3',
          100: '#f9ede0',
          200: '#f2d9bf',
          300: '#e9be94',
          400: '#de9c66',
          500: '#d68147',
          600: '#c8693c',
          700: '#a65233',
          800: '#854330',
          900: '#6c3829',
          950: '#3a1b14',
        },
        forest: {
          50: '#f3f6f3',
          100: '#e3e9e3',
          200: '#c7d4c8',
          300: '#a1b6a3',
          400: '#78937b',
          500: '#587a5c',
          600: '#446148',
          700: '#384e3b',
          800: '#2f4032',
          900: '#28352b',
          950: '#141d17',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        hebrew: ['Heebo', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
