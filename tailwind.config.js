/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--fg-muted) / <alpha-value>)',
        'fg-subtle': 'rgb(var(--fg-subtle) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--primary-hover) / <alpha-value>)',
        'primary-muted': 'rgb(var(--primary-muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-focus': 'rgb(var(--border-focus) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
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
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 32px -4px rgb(var(--primary-glow) / 0.25)',
        'glow-sm': '0 0 20px -4px rgb(var(--primary-glow) / 0.2)',
        card: '0 4px 24px -4px rgb(0 0 0 / 0.06), 0 2px 8px -2px rgb(0 0 0 / 0.04)',
        'card-hover': '0 12px 40px -8px rgb(0 0 0 / 0.08), 0 4px 16px -4px rgb(0 0 0 / 0.04)',
      },
      maxWidth: {
        content: 'min(100% - 2rem, 480px)',
        'content-wide': 'min(100% - 2rem, 640px)',
      },
      /* Design system: typography scale */
      fontSize: {
        'ds-display': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'ds-h1': ['clamp(1.5rem, 4vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'ds-h2': ['clamp(1.125rem, 3vw, 1.5rem)', { lineHeight: '1.3' }],
        'ds-body': ['1rem', { lineHeight: '1.5' }],
        'ds-body-sm': ['0.875rem', { lineHeight: '1.45' }],
        'ds-micro': ['0.75rem', { lineHeight: '1.4' }],
        'ds-caption': ['0.6875rem', { lineHeight: '1.35' }],
      },
      /* Design system: spacing (align with CSS vars) */
      spacing: {
        'page-x': '1rem',
        'page-y': '1.25rem',
        'section': '1.5rem',
        'section-lg': '2rem',
      },
      /* Design system: grid */
      gridTemplateColumns: {
        'content': '1fr',
        'content-sm': 'repeat(auto-fill, minmax(280px, 1fr))',
        'content-md': 'repeat(auto-fill, minmax(320px, 1fr))',
      },
      /* Design system: transitions */
      transitionDuration: {
        'ds-fast': '150ms',
        'ds-normal': '200ms',
      },
      transitionTimingFunction: {
        'ds-ease': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
    },
  },
  plugins: [],
};
