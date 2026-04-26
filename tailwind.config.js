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
        sans: ['Nunito', 'system-ui', 'sans-serif'],
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
    },
  },
  plugins: [],
}
