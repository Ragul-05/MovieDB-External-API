/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        secondary: "#0D9488",
        background: "#F3F4F6",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        dark: "#111827",
      },
      borderRadius: {
        'card': '12px',
      },
      fontFamily: {
        interface: ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
