/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#05070A',
          secondary: '#0D1117',
        },
        card: {
          bg: 'rgba(13,17,23,0.7)',
        },
        accent: {
          primary: '#00F2FF',
          secondary: '#7000FF',
        },
        status: {
          success: '#39FF14',
          danger: '#FF4D4D',
        },
        text: {
          muted: '#8B949E',
        }
      },
    },
  },
  plugins: [],
}
