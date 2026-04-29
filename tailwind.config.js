/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        rule: 'rgb(var(--color-rule) / <alpha-value>)',
        'rule-strong': '#1F1F1D',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        whisper: 'rgb(var(--color-whisper) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        widest: '0.3em',
        ultrawide: '0.42em',
      },
    },
  },
  plugins: [],
};
