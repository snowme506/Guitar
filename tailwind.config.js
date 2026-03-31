/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFB347',
        secondary: '#87CEEB',
        accent: '#98D8AA',
        highlight: '#FF6B9D',
        background: '#FFF9F0',
        surface: '#FFFFFF',
        surface2: '#FFF0E6',
        text: '#5D4E37',
        'text-light': '#8B7355',
        success: '#7ED957',
        error: '#FF8A80',
        warning: '#FFD54F',
        star: '#FFD700',
        gold: '#FFA000',
        purple: '#B39DDB',
      },
      fontFamily: {
        heading: ['ZCOOL KuaiLe', 'Nunito', 'cursive'],
        body: ['ZCOOL XiaoWei', 'Nunito', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
