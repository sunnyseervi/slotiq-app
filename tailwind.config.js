/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   '#F5620F',
        navy:      '#1A1A2E',
        hgreen:    '#2D7A3A',
        success:   '#22C55E',
        warning:   '#F59E0B',
        danger:    '#EF4444',
        muted:     '#6B7280',
        border:    '#E5E7EB',
        appbg:     '#F5F5F5',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        pill: '50px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
        cardmd: '0 4px 24px rgba(0,0,0,0.12)',
      },
      maxWidth: {
        app: '430px',
      },
      keyframes: {
        'drive': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-2px) rotate(-2deg)' },
          '75%': { transform: 'translateY(1px) rotate(2deg)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      animation: {
        'drive': 'drive 2s ease-in-out infinite',
        'pop': 'pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    },
  },
  plugins: [],
}
