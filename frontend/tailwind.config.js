/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"DM Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        cyber: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        dark: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          DEFAULT: '#818cf8',
          hover:   '#a5b4fc',
          light:   '#312e81',
          glow:    'rgba(129,140,248,0.35)',
        },
        neon: {
          blue:   '#38bdf8',
          purple: '#a78bfa',
          pink:   '#f472b6',
          green:  '#34d399',
          cyan:   '#22d3ee',
        },
        success: '#34d399',
        danger:  '#f87171',
        warning: '#fbbf24',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'border-glow': 'border-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(129,140,248,0.2)' },
          '50%': { borderColor: 'rgba(129,140,248,0.5)' },
        },
      },
      backgroundImage: {
        'cyber-radial': 'radial-gradient(ellipse at 50% 0%, rgba(129,140,248,0.15) 0%, transparent 60%)',
        'hero-gradient': 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 100%)',
      },
    },
  },
  plugins: [],
}
