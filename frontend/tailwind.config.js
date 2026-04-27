/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    // Explicit breakpoints aligned to common device widths
    screens: {
      'xs':  '375px',   // small phones
      'sm':  '640px',   // large phones / small tablets
      'md':  '768px',   // tablets
      'lg':  '1024px',  // small laptops
      'xl':  '1280px',  // desktops
      '2xl': '1536px',  // large desktops / foldables open
    },
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      // ── Fluid type scale via clamp(min, preferred, max) ──────────────────
      // Each level scales smoothly from mobile → desktop without breakpoints.
      fontSize: {
        'fluid-2xs': ['clamp(0.6rem,  0.8vw + 0.3rem, 0.65rem)',  { lineHeight: '1rem' }],
        'fluid-xs':  ['clamp(0.65rem, 1vw   + 0.3rem, 0.75rem)',  { lineHeight: '1rem' }],
        'fluid-sm':  ['clamp(0.75rem, 1.2vw + 0.35rem, 0.875rem)',{ lineHeight: '1.25rem' }],
        'fluid-base':['clamp(0.875rem,1.5vw + 0.35rem, 1rem)',    { lineHeight: '1.5rem' }],
        'fluid-lg':  ['clamp(1rem,    1.8vw + 0.4rem, 1.125rem)', { lineHeight: '1.75rem' }],
        'fluid-xl':  ['clamp(1.1rem,  2.2vw + 0.4rem, 1.25rem)',  { lineHeight: '1.75rem' }],
        'fluid-2xl': ['clamp(1.2rem,  3vw   + 0.4rem, 1.5rem)',   { lineHeight: '2rem' }],
        'fluid-3xl': ['clamp(1.4rem,  4vw   + 0.5rem, 1.875rem)', { lineHeight: '2.25rem' }],
        'fluid-4xl': ['clamp(1.7rem,  5vw   + 0.5rem, 2.25rem)',  { lineHeight: '2.5rem' }],
        'fluid-5xl': ['clamp(2rem,    6vw   + 0.5rem, 3rem)',     { lineHeight: '1.1' }],
      },
      // ── Fluid spacing ─────────────────────────────────────────────────────
      spacing: {
        'fluid-1': 'clamp(0.25rem, 0.5vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem,  1vw,   0.75rem)',
        'fluid-3': 'clamp(0.75rem, 1.5vw, 1rem)',
        'fluid-4': 'clamp(1rem,    2vw,   1.5rem)',
        'fluid-5': 'clamp(1.25rem, 2.5vw, 1.75rem)',
        'fluid-6': 'clamp(1.25rem, 3vw,   2rem)',
        'fluid-8': 'clamp(1.5rem,  4vw,   2.5rem)',
        // Sidebar open width as spacing token
        'sidebar-open': 'var(--sidebar-open)',
      },
      maxWidth: {
        'fluid':    '90vw',
        'fluid-lg': 'min(90vw, 72rem)', 
        'fluid-xl': 'min(92vw, 80rem)',
      },
      boxShadow: {
        card:       '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        'card-hover':'0 4px 12px 0 rgb(0 0 0 / 0.12)',
      },
      animation: {
        'slide-in':   'slideIn   0.25s ease-out both',
        'fade-in':    'fadeIn    0.18s ease-out both',
        'dropdown':   'dropdown  0.2s  cubic-bezier(0.16,1,0.3,1) both',
        'spin-once':  'spinOnce  0.35s ease-out both',
        'pulse-once': 'pulseOnce 0.4s  ease-out both',
      },
      keyframes: {
        slideIn:   { '0%': { transform: 'translateX(100%)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        fadeIn:    { '0%': { opacity: '0', transform: 'translateY(4px)' },  '100%': { opacity: '1', transform: 'translateY(0)' } },
        dropdown:  { '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.97)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        spinOnce:  { '0%': { transform: 'rotate(-30deg)' }, '100%': { transform: 'rotate(0deg)' } },
        pulseOnce: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3)' }, '100%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
