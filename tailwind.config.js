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
          cream: '#FFFDF9',
          warm: '#FDF6EE',
          peach: '#FFE7D6',
          coral: '#FF7B60',
          'coral-light': '#FFF0EB',
          sun: '#FDCB6E',
          'sun-light': '#FFF8E7',
          mint: '#55EFC4',
          'mint-light': '#E8FAF4',
          sky: '#74B9FF',
          'sky-light': '#EDF5FF',
          lavender: '#A29BFE',
          'lavender-light': '#F1EFFF',
          sand: '#ECE5DD',
          charcoal: '#2D3436',
          subtle: '#636E72',
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
        'soft': '0 4px 20px -2px rgba(253, 169, 137, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 25px -3px rgba(253, 169, 137, 0.18), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
        'nav': '0 -4px 20px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
