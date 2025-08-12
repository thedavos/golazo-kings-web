import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        // GolazoKings FC Colors
        'go-blue': 'hsl(var(--go-blue) / <alpha-value>)', // Azul EA FC principal
        'go-cyan': 'hsl(var(--go-cyan) / <alpha-value>)', // Cyan vibrante
        'go-purple': 'hsl(var(--go-purple) / <alpha-value>)', // Púrpura premium
        'go-green': 'hsl(var(--go-green) / <alpha-value>)', // Verde campo
        'go-gold': 'hsl(var(--go-gold) / <alpha-value>)', // Oro premium
        'go-orange': 'hsl(var(--go-orange) / <alpha-value>)', // Naranja leyenda
        'go-red': 'hsl(var(--go-red) / <alpha-value>)', // Rojo competitivo
        'go-pink': 'hsl(var(--go-pink) / <alpha-value>)', // Rosa especial

        // Background System
        'bg-primary': 'hsl(var(--bg-primary) / <alpha-value>)', // Fondo principal más oscuro
        'bg-secondary': 'hsl(var(--bg-secondary) / <alpha-value>)', // Superficie secundaria
        'bg-tertiary': 'hsl(var(--bg-tertiary) / <alpha-value>)', // Superficie terciaria
        'bg-card': 'hsl(var(--bg-card) / <alpha-value>)', // Cards jugadores
        'bg-glass': 'hsl(var(--bg-glass) / <alpha-value>)', // Efecto glass
        'bg-field': 'hsl(var(--bg-field) / <alpha-value>)', // Verde campo
        'bg-pitch': 'hsl(var(--bg-pitch) / <alpha-value>)', // Verde césped

        // Rating Colors específicos para cartas
        'rating-bronze': 'hsl(var(--rating-bronze) / <alpha-value>)',
        'rating-silver': 'hsl(var(--rating-silver) / <alpha-value>)',
        'rating-gold': 'hsl(var(--rating-gold) / <alpha-value>)',
        'rating-inform': 'hsl(var(--rating-inform) / <alpha-value>)',
        'rating-special': 'hsl(var(--rating-special) / <alpha-value>)',
        'rating-icon': 'hsl(var(--rating-icon) / <alpha-value>)',
        'rating-legend': 'hsl(var(--rating-legend) / <alpha-value>)',

        // Standard colors
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
      },
      backgroundImage: {
        'gradient-go-primary': 'var(--gradient-go-primary)',
        'gradient-go-secondary': 'var(--gradient-go-secondary)',
        'gradient-field': 'var(--gradient-field)',
        'gradient-pitch': 'var(--gradient-pitch)',
        'gradient-card-gold': 'var(--gradient-card-gold)',
        'gradient-card-special': 'var(--gradient-card-special)',
        'gradient-card-icon': 'var(--gradient-card-icon)',
        'gradient-glass': 'var(--gradient-glass)',
        'gradient-premium': 'var(--gradient-premium)',
        'gradient-legend': 'var(--gradient-legend)',
      },
      boxShadow: {
        'glow-go-blue': 'var(--shadow-glow-go-blue)',
        'glow-go-cyan': 'var(--shadow-glow-go-cyan)',
        'glow-purple': 'var(--shadow-glow-purple)',
        'glow-gold': 'var(--shadow-glow-gold)',
        'glow-green': 'var(--shadow-glow-green)',
        'glow-red': 'var(--shadow-glow-red)',

        // Sombras específicas para cartas
        'card-bronze': 'var(--shadow-card-bronze)',
        'card-silver': 'var(--shadow-card-silver)',
        'card-gold': 'var(--shadow-card-gold)',
        'card-special': 'var(--shadow-card-special)',
        'card-icon': 'var(--shadow-card-icon)',
        'card-legend': 'var(--shadow-card-legend)',

        // Sombras generales
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        premium: 'var(--shadow-premium)',
        glass: 'var(--shadow-glass)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card: '1.2rem',
        field: '0.8rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'float-particle': {
          '0%': {
            transform: 'translateY(100vh) translateX(0) rotate(0deg)',
            opacity: '0',
          },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': {
            transform: 'translateY(-10vh) translateX(50px) rotate(360deg)',
            opacity: '0',
          },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 20px hsl(var(--go-blue) / 0.4)' },
          '100%': {
            boxShadow: '0 0 40px hsl(var(--go-blue) / 0.8), 0 0 60px hsl(var(--go-blue) / 0.4)',
          },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'card-hover': {
          '0%': {
            transform: 'translateY(0) scale(1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
          '100%': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 20px 40px rgba(14, 165, 233, 0.3)',
          },
        },
        'field-glow': {
          '0%': {
            boxShadow: '0 0 30px hsl(var(--go-green) / 0.3)',
          },
          '50%': {
            boxShadow:
              '0 0 50px hsl(var(--go-green) / 0.6), inset 0 0 30px hsl(var(--go-green) / 0.1)',
          },
          '100%': {
            boxShadow: '0 0 30px hsl(var(--go-green) / 0.3)',
          },
        },
        'premium-pulse': {
          '0%': {
            boxShadow: '0 0 20px hsl(var(--go-gold) / 0.4)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 40px hsl(var(--go-gold) / 0.8), 0 0 80px hsl(var(--go-gold) / 0.4)',
            transform: 'scale(1.05)',
          },
          '100%': {
            boxShadow: '0 0 20px hsl(var(--go-gold) / 0.4)',
            transform: 'scale(1)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float-particle': 'var(--animate-float-particle)',
        'pulse-glow': 'var(--animate-pulse-glow)',
        'border-flow': 'var(--animate-border-flow)',
        shimmer: 'shimmer 2s ease-in-out infinite',
        'card-hover': 'var(--animate-card-hover)',
        'field-glow': 'var(--animate-field-glow)',
        'premium-pulse': 'var(--animate-premium-pulse)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'go-smooth': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      spacing: {
        card: '20rem', // Ancho estándar de carta
        field: '40rem', // Ancho de campo
        pitch: '60rem', // Ancho completo de cancha
      },
      backdropBlur: {
        card: '12px',
        glass: '16px',
        premium: '20px',
      },
      scale: {
        '102': '1.02',
        '105': '1.05',
        '98': '0.98',
      },
    },
  },
} satisfies Config;
