/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../apps/vscode/src/**/*.{js,ts,jsx,tsx,html}",
    "../../apps/cli/src/**/*.{js,ts,jsx,tsx,html}"
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0B0F17',
        darkCard: 'rgba(17, 24, 39, 0.75)',
        darkCardHover: 'rgba(31, 41, 55, 0.85)',
        accentCyan: '#06B6D4',
        accentIndigo: '#6366F1',
        accentRed: '#F43F5E',
        accentYellow: '#F59E0B',
        accentGreen: '#10B981',
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
