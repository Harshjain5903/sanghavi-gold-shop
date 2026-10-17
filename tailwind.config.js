/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.tsx', './index.tsx', './components/**/*.tsx', './pages/**/*.tsx', './context/**/*.tsx', './lib/**/*.ts'],
  // Admin action cards build their icon colour at runtime (bg-x-500 -> text-x-500), which the scanner can't see.
  safelist: ['text-green-500', 'text-blue-500', 'text-purple-500', 'text-gray-500', 'text-pink-500', 'text-orange-500'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFFAE5',
          100: '#FFF9C4',
          200: '#FCEEA1',
          300: '#FBC02D',
          400: '#EAB308',
          500: '#D4AF37', // Classic metallic gold
          600: '#B8860B',
          700: '#806000',
          800: '#5F4600',
          900: '#423000',
        },
        brand: {
          black: '#000000',
          dark: '#1A1A1A',
          light: '#F9F9F9',
          gray: '#F5F5F5',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
