/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
      },
    },
  },
  plugins: [],
};
