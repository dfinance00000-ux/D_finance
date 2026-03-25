/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Financial Theme Colors
        primary: {
          DEFAULT: '#1e293b', // slate-900 (Sidebar)
          light: '#334155',   // slate-700
        },
        accent: {
          DEFAULT: '#10b981', // emerald-500 (Success/Money)
          hover: '#059669',
        },
        finance: {
          blue: '#1e40af',    // blue-800
          light: '#f8fafc',   // gray-50 (Background)
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}