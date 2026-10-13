/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--bg)',
          panel: 'var(--panel)',
          line: 'var(--line)',
          text: 'var(--text)',
          mute: 'var(--mute)',
          accent: 'var(--accent)',
          teal: 'var(--teal)',
          amber: 'var(--amber)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
