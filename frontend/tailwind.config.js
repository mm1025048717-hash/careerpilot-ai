/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-blue': '#007AFF',
        'apple-bg': '#F5F5F7',
        'apple-gray': '#86868B',
      },
    },
  },
  plugins: [],
}

