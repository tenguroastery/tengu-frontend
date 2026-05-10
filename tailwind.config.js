/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tengu: {
          ink: '#1F4E9C',
          mustard: '#C8842A',
          coral: '#E63946',
          pink: '#E91E63',
          dark: '#0F0F0F',
          cream: '#F5F1EA',
        },
      },
      fontFamily: {
        display: ['Bungee', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
