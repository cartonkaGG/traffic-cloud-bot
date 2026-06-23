/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F59E0B',
        secondary: '#FBBF24',
        accent: '#8B5CF6',
        surface: '#1E293B',
        background: '#0F172A',
        foreground: '#F8FAFC',
        muted: '#94A3B8',
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Exo 2', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.3)',
      },
    },
  },
  plugins: [],
};
