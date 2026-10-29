/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        automotive: {
          darkest: '#070B14',
          bg: '#0A101D',
          card: '#0F172A',
          cardHover: '#131E35',
          border: '#1E293B',
          cyan: '#06B6D4',
          cyanLight: '#38BDF8',
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px -2px rgba(16, 185, 129, 0.5)',
        'glow-yellow': '0 0 20px -2px rgba(245, 158, 11, 0.5)',
        'glow-red': '0 0 25px -2px rgba(239, 68, 68, 0.6)',
        'glow-cyan': '0 0 20px -2px rgba(6, 182, 212, 0.4)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
