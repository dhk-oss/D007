/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          // Soft off-white & lavender tint backgrounds
          cream: '#FAF8FC',
          warm: '#F4EFFA',
          peach: '#EAE2F3', // subtle plum-tinted borders and accents
          plum: '#8B68BD',
          'plum-dark': '#7A56AE',
          'plum-light': '#F4EFFA',
          'plum-border': '#EAE2F3',
          // Primary accent: refined soft mauve / muted lilac
          coral: '#8B68BD',
          'coral-light': '#F4EFFA',
          'coral-dark': '#7A56AE',
          sun: '#B493DB',
          'sun-light': '#F9F5FD',
          mint: '#55C29C',
          'mint-light': '#EBF8F4',
          sky: '#739FE8',
          'sky-light': '#EEF4FD',
          lavender: '#8B68BD',
          'lavender-light': '#F4EFFA',
          sand: '#E9E2F1',
          charcoal: '#231B2E',
          subtle: '#5A4F6B',
        },
        mauve: {
          50: '#FAF8FC',
          100: '#F4EFFA',
          200: '#EAE2F3',
          300: '#D5C4E9',
          400: '#B493DB',
          500: '#8B68BD',
          600: '#7A56AE',
          700: '#644293',
          800: '#4D3372',
          900: '#231B2E',
        }
      },
      fontFamily: {
        // Primary sans: Nunito for Latin, Pretendard Variable for Korean/CJK, then system fallbacks
        sans: [
          'Nunito',
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'sans-serif',
        ],
        // Display font (brand title): Playfair Display for Latin, Pretendard for Korean
        display: [
          'Playfair Display',
          'Pretendard Variable',
          'Pretendard',
          'Georgia',
          'serif',
        ],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(139, 104, 189, 0.12), 0 2px 6px -1px rgba(35, 27, 46, 0.04)',
        'soft-lg': '0 10px 25px -3px rgba(139, 104, 189, 0.18), 0 4px 10px -2px rgba(35, 27, 46, 0.05)',
        'nav': '0 -4px 20px 0 rgba(35, 27, 46, 0.05)',
      }
    },
  },
  plugins: [],
}
