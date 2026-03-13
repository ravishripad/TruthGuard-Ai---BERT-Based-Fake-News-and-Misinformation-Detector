/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        pro: {
          bg:      '#000000',
          surface: '#121212',
          card:    '#1c1c1e',
          text:    '#f5f5f7',
          sub:     '#86868b',
          blue:    '#0071e3',
          border:  'rgba(255,255,255,0.1)',
        },
        tech: {
          cyan:    '#2997ff',
          violet:  '#a259ff',
          lime:    '#30d158',
          rose:    '#ff375f',
        }
      },
      borderRadius: {
        '3xl': '1.25rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'pro-gradient': 'radial-gradient(circle at 50% 50%, #1c1c1e 0%, #000000 100%)',
      }
    },
  },
  plugins: [],
}
