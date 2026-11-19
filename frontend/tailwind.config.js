/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18', // Deep midnight navy background
          900: '#0B132B', // Dark card background
          850: '#111D42', // Hover card / border
          800: '#1C2541', // Elevated surface
          700: '#3A506B', // Subtle text / border
        },
        accent: {
          cyan: '#48CAE4',
          blue: '#0077B6',
          teal: '#2EC4B6',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}
