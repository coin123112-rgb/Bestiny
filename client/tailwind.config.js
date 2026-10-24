/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'sp-bg':        '#0F1115',
        'sp-surface':   '#1A1D23',
        'sp-card':      '#1E2228',
        'sp-border':    '#2A2D35',
        'sp-green':     '#1DB954',
        'sp-green-alt': '#00FF66',
        'sp-text':      '#FFFFFF',
        'sp-muted':     '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-green': 'pulseGreen 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave':        'wave 1.2s linear infinite',
        'fade-in':     'fadeIn 0.3s ease-in-out',
        'slide-up':    'slideUp 0.3s ease-out',
      },
      keyframes: {
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 8px #1DB954' },
          '50%':      { boxShadow: '0 0 20px #1DB954, 0 0 40px #1DB95466' },
        },
        wave: {
          '0%':   { transform: 'scaleY(1)' },
          '50%':  { transform: 'scaleY(0.4)' },
          '100%': { transform: 'scaleY(1)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
