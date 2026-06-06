import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Page background — warm off-white, like unbleached field paper
        canvas: '#F5F4F0',
        border: '#E2E0DA',

        // Text
        ink: '#1A1917',
        muted: '#78716C',

        // Brand greens — references the land, not tech
        green: {
          50: '#EBFBEF',
          100: '#D1EED9',
          200: '#A8D9B6',
          500: '#40916C',
          700: '#2D6A4F',
          900: '#1A3D2B',
        },

        // Harvest amber — for highlights and warnings
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          600: '#D97706',
          700: '#B45309',
        },

        // Alert red
        red: {
          50: '#FFF1F1',
          100: '#FEE2E2',
          600: '#DC2626',
        },

        // Sky blue — for humidity/rainfall accent
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          600: '#0284C7',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        mono: ['ui-monospace', '"Cascadia Code"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
};

export default config;
