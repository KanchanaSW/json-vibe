import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9213ec',
        accent: '#22d3ee',
        'bg-main': '#0f0f11',
        'bg-panel': '#18181b',
        'bg-surface': '#27272a',
        'border-subtle': '#27272a',
        'border-active': '#3f3f46',
        'text-main': '#e4e4e7',
        'text-muted': '#a1a1aa',
        'code-key': '#9cdcfe',
        'code-string': '#ce9178',
        'code-number': '#b5cea8',
        'code-bool': '#569cd6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(146, 19, 236, 0.3)',
        'neon-active': '0 0 15px rgba(34, 211, 238, 0.2)',
      },
    },
  },
  plugins: [],
}
export default config

