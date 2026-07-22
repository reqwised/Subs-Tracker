/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F6F8',
        surface: '#FFFFFF',
        ink: '#14181F',
        muted: '#6B7280',
        line: '#E2E4E9',
        pine: {
          DEFAULT: '#2F5D50',
          dark: '#1F4038',
          light: '#E8F0EE',
        },
        status: {
          active: '#1E8E5A',
          activeBg: '#E7F5EE',
          soon: '#C9820A',
          soonBg: '#FBF0DD',
          expired: '#C0392B',
          expiredBg: '#FBEAE8',
          cancelled: '#8A8F98',
          cancelledBg: '#EEEFF1',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, #D8DBE1 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '14px 14px',
      },
    },
  },
  plugins: [],
}
