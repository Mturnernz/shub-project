/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
        // Coral — warmth, approachability (used sparingly)
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
        // Neutral surfaces for dark mode support
        surface: {
          light: '#FFFFFF',
          'light-alt': '#F8FAFC',
          dark: '#121212',
          'dark-alt': '#1E1E1E',
          'dark-elevated': '#2D2D2D',
        },
        // Text colors for dark mode support
        text: {
          primary: '#1A202C',
          secondary: '#4A5568',
          muted: '#A0AEC0',
          'primary-dark': '#E5E5E5',
          'secondary-dark': '#A0AEC0',
          'muted-dark': '#718096',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
