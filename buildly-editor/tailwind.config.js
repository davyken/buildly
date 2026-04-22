/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        canvas: '#0e0e10',
        surface: '#18181b',
        panel: '#1c1c1f',
        border: '#2a2a2e',
        accent: '#6ee7b7',
        'accent-dim': '#34d399',
        muted: '#71717a',
        text: '#fafafa',
        'text-dim': '#a1a1aa',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(110,231,183,0.15)',
        'panel': '0 4px 24px rgba(0,0,0,0.4)',
        'element': '0 2px 12px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'slide-in-left': 'slideInLeft 0.25s ease-out',
        'pop': 'pop 0.15s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideInLeft: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pop: { '0%': { transform: 'scale(0.95)' }, '60%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
