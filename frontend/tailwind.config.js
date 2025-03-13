export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#5dc985',
          DEFAULT: '#3BB75E',
          dark: '#2d9148',
        },
        secondary: {
          light: '#f8f8f8',
          DEFAULT: '#f0f0f0',
          dark: '#e0e0e0',
        },
      },
    },
  },
  plugins: [],
}