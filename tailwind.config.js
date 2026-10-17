/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#F8FAFC',
          dark: '#0B0F19',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#111827',
        },
        subtle: {
          light: '#F1F5F9',
          dark: '#1E293B',
        },
        borderSubtle: {
          light: '#E2E8F0',
          dark: '#1F2937',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Fira Code', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
