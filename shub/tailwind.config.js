/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary blue — trust, stability, professionalism
        trust: {
          50: '#EBF5FF',
          100: '#D6EBFF',
          200: '#ADD6FF',
          300: '#7ABBFF',
          400: '#3D9AFF',
          500: '#0066CC',
          600: '#0052A3',
          700: '#003D7A',
          800: '#002952',
          900: '#001F3F',
        },
        // Green — safety, health, confirmation
        safe: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        // Coral — warmth, approachability (kept for gradient compatibility)
        warm: {
          50: '#FFF5F2',
          100: '#FFE8E0',
          200: '#FFCFC0',
          300: '#FFB09A',
          400: '#FF8B6A',
          500: '#FF6B4A',
          600: '#E85D3A',
          700: '#C44D2E',
          800: '#A03D24',
          900: '#7D301C',
        },
        // Rose — soft pink/mauve accent (design refresh)
        rose: {
          50: '#FFF1F3',
          100: '#FFE4E9',
          200: '#FECDD6',
          300: '#FEA3B4',
          400: '#FB7090',
          500: '#F43F6A',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
        },
        // Gold — premium, featured, highlighted
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Neutral surfaces — warm whites and deep charcoals
        surface: {
          light: '#FAFAF8',
          'light-alt': '#F5F4F0',
          dark: '#18181A',
          'dark-alt': '#222224',
          'dark-elevated': '#2E2E32',
        },
        // Text colors for dark mode support
        text: {
          primary: '#1C1917',
          secondary: '#57534E',
          muted: '#A8A29E',
          'primary-dark': '#F0EEF5',
          'secondary-dark': '#A8A29E',
          'muted-dark': '#78716C',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-lg': ['2.75rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'display-sm': ['1.75rem', { lineHeight: '1.2', fontWeight: '600' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
