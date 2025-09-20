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
        manrope: ['Manrope', 'sans-serif'],
      },
      colors: {
        // Primitive Colors
        CB: {
          '100': 'hsl(var(--color-CB-100) / <alpha-value>)',
          '200': 'hsl(var(--color-CB-200) / <alpha-value>)',
          '300': 'hsl(var(--color-CB-300) / <alpha-value>)',
          '400': 'hsl(var(--color-CB-400) / <alpha-value>)',
          '500': 'hsl(var(--color-CB-500) / <alpha-value>)',
          '600': 'hsl(var(--color-CB-600) / <alpha-value>)',
          '700': 'hsl(var(--color-CB-700) / <alpha-value>)',
        },
        MC: {
          '100': 'hsl(var(--color-MC-100) / <alpha-value>)',
          '200': 'hsl(var(--color-MC-200) / <alpha-value>)',
          '300': 'hsl(var(--color-MC-300) / <alpha-value>)',
          '400': 'hsl(var(--color-MC-400) / <alpha-value>)',
        },
        SF: {
          '100': 'hsl(var(--color-SF-100) / <alpha-value>)',
          '200': 'hsl(var(--color-SF-200) / <alpha-value>)',
          '300': 'hsl(var(--color-SF-300) / <alpha-value>)',
          '400': 'hsl(var(--color-SF-400) / <alpha-value>)',
          '500': 'hsl(var(--color-SF-500) / <alpha-value>)',
          '600': 'hsl(var(--color-SF-600) / <alpha-value>)',
          '700': 'hsl(var(--color-SF-700) / <alpha-value>)',
        },
        RB: {
          '100': 'hsl(var(--color-RB-100) / <alpha-value>)',
          '200': 'hsl(var(--color-RB-200) / <alpha-value>)',
          '300': 'hsl(var(--color-RB-300) / <alpha-value>)',
          '400': 'hsl(var(--color-RB-400) / <alpha-value>)',
          '500': 'hsl(var(--color-RB-500) / <alpha-value>)',
          '600': 'hsl(var(--color-RB-600) / <alpha-value>)',
          '700': 'hsl(var(--color-RB-700) / <alpha-value>)',
        },
        Extended: {
          Text: 'hsl(var(--color-Extended-Text) / <alpha-value>)',
          Banner: 'hsl(var(--color-Extended-Banner) / <alpha-value>)',
          Banner2: 'hsl(var(--color-Extended-Banner2) / <alpha-value>)',
          Graphics2: 'hsl(var(--color-Extended-Graphics2) / <alpha-value>)',
          Graphics3: 'hsl(var(--color-Extended-Graphics3) / <alpha-value>)',
          Sections: 'hsl(var(--color-Extended-Sections) / <alpha-value>)',
          CompetitiveGaming: 'hsl(var(--color-Extended-CompetitiveGaming) / <alpha-value>)',
          Graphics: 'hsl(var(--color-Extended-Graphics) / <alpha-value>)',
        },
        // shadcn/ui compatible colors
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
        'gradient-aurora': 'var(--gradient-aurora)',
      },
      boxShadow: {
        'elev-10': 'var(--shadow-elev-10)',
      },
      borderRadius: {
        xxs: 'var(--radius-xxs)',
        sm: 'var(--radius-sm)',
        base: 'var(--radius-base)',
        md: 'var(--radius-md)',
      },
      spacing: {
        cero: 'var(--spacing-cero)',
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        base: 'var(--spacing-base)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        '4xl': 'var(--spacing-4xl)',
        '5xl': 'var(--spacing-5xl)',
        '6xl': 'var(--spacing-6xl)',
        '7xl': 'var(--spacing-7xl)',
        '8xl': 'var(--spacing-8xl)',
      },
      fontSize: {
        xxs: '10px',
        xs: '12px',
        sm: '14px',
        base: '16px',
        md: '20px',
        '2md': '24px',
        '3md': '32px',
        lg: '48px',
        xl: '64px',
      },
      fontWeight: {
        regular: 'var(--font-weight-regular)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
} satisfies Config;
