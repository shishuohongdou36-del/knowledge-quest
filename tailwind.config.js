/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'domain-ai': '#6366f1',
        'domain-product': '#f59e0b',
        'domain-business': '#10b981',
        'domain-thinking': '#8b5cf6',
        'domain-cross': '#ec4899',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
