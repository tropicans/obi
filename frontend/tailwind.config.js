/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        // Apple-inspired palette
        apple: {
          gray: '#f5f5f7', // Light gray background
          dark: '#1d1d1f', // Dark text
          blue: '#0071e3', // Action blue
          blueHover: '#0077ed',
          red: '#ff3b30', // Alert red
          green: '#34c759', // Success green
          orange: '#ff9500', // Warning orange
          card: 'rgba(255, 255, 255, 0.72)', // Glassy card background
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'apple-card': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
