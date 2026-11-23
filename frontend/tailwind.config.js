/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        /* ── Forest Green Palette ── */
        'forest': {
          DEFAULT: '#1B4332',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#1B4332',
        },
        'emerald': {
          DEFAULT: '#2D6A4F',
          light: '#40916C',
          bright: '#52B788',
          pale: '#74C69D',
          mist: '#B7E4C7',
          frost: '#D8F3DC',
        },

        /* ── Electric Purple Palette ── */
        'electric': {
          DEFAULT: '#7C3AED',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          soft: '#8B5CF6',
          dim: '#6D28D9',
          glow: 'rgba(124, 58, 237, 0.15)',
        },

        /* ── Neutrals ── */
        'slate': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        /* ── Status Colors ── */
        'success': { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#065F46' },
        'warning': { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#92400E' },
        'danger':  { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#991B1B' },
        'info':    { DEFAULT: '#3B82F6', light: '#DBEAFE', dark: '#1E40AF' },

        /* ── Legacy compat aliases ── */
        'burnt-orange': {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9',
          light: '#F5F3FF',
          dim: '#8B5CF6',
          dark: '#5B21B6',
        },
        'charcoal': {
          DEFAULT: '#1E293B',
          muted: '#475569',
          dim: '#64748B',
        },
        'lime-green': {
          DEFAULT: '#22C55E',
          dark: '#15803D',
          light: '#F0FDF4',
          dim: '#16A34A',
        },
        'deep-green': '#14532D',
        'dark-charcoal': '#1E293B',
        'warm-charcoal': '#475569',
        'muted-brown': '#64748B',
        'deep-brown': '#0F172A',
        'terracotta': { DEFAULT: '#EF4444', dim: '#DC2626' },
        'neu-base': {
          DEFAULT: '#F8FAFC',
          light: '#FFFFFF',
          dark: '#F1F5F9',
          deeper: '#E2E8F0',
        },
        'warm-ivory': { DEFAULT: '#F8FAFC', light: '#FFFFFF', dark: '#F1F5F9', muted: '#E2E8F0' },
        'soft-ivory': '#E2E8F0',
        'burnt-orange-link': '#7C3AED',
        night: { DEFAULT: '#F8FAFC', deep: '#F1F5F9', lighter: '#FFFFFF' },
        'cyan-neon': { DEFAULT: '#2D6A4F', accent: '#52B788', dim: '#1B4332' },
        cloud: '#1E293B',
        beige: { DEFAULT: '#475569', dim: '#64748B', muted: '#64748B' },
        surface: { DEFAULT: '#FFFFFF', hover: '#F8FAFC' },

        /* ── ShadCN Token Colors ── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'neu': '16px',
        'neu-lg': '24px',
        'neu-xl': '32px',
        'glass': '20px',
      },
      boxShadow: {
        /* ── Glass Shadow System ── */
        'glass-sm': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'glass': '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'glass-md': '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06)',
        'glass-xl': '0 24px 64px rgba(0, 0, 0, 0.12), 0 12px 24px rgba(0, 0, 0, 0.06)',
        'glass-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
        'glass-border': '0 0 0 1px rgba(255, 255, 255, 0.1)',

        /* ── Purple Glow System ── */
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.15), 0 4px 16px rgba(124, 58, 237, 0.1)',
        'glow-purple-lg': '0 0 40px rgba(124, 58, 237, 0.2), 0 8px 32px rgba(124, 58, 237, 0.12)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.15), 0 4px 16px rgba(34, 197, 94, 0.1)',
        'glow-green-lg': '0 0 40px rgba(45, 106, 79, 0.2), 0 8px 32px rgba(45, 106, 79, 0.12)',

        /* ── Card Hover Effects ── */
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.06)',
        'card-pin': '0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',

        /* ── Legacy compat ── */
        'neu-raised-xs': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'neu-raised-sm': '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'neu-raised': '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'neu-raised-md': '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
        'neu-raised-lg': '0 16px 48px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06)',
        'neu-inset-xs': 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
        'neu-inset-sm': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'neu-inset': 'inset 0 2px 6px rgba(0, 0, 0, 0.06)',
        'neu-flat': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'neu-btn': '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'neu-btn-active': 'inset 0 2px 4px rgba(0, 0, 0, 0.08)',
        'glow-orange': '0 0 20px rgba(124, 58, 237, 0.15), 0 4px 16px rgba(124, 58, 237, 0.1)',
        'glow-orange-lg': '0 0 40px rgba(124, 58, 237, 0.2)',
        'glow-lime': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow-electric': '0 0 20px rgba(124, 58, 237, 0.15)',
        'glow-electric-lg': '0 0 35px rgba(124, 58, 237, 0.2)',
        'glow-cyan': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow-cyan-lg': '0 0 35px rgba(34, 197, 94, 0.2)',
        'glow-terracotta': '0 0 20px rgba(239, 68, 68, 0.15)',
        'warm-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'warm-md': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'warm-lg': '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, #1B4332 0%, #2D6A4F 40%, #F8FAFC 100%)',
        'hero-radial': 'radial-gradient(ellipse at top, rgba(27, 67, 50, 0.08) 0%, transparent 60%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
        'glass-gradient-strong': 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 100%)',
        'purple-gradient': 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
        'purple-gradient-soft': 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)',
        'green-gradient': 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
        'green-gradient-soft': 'linear-gradient(135deg, #D8F3DC 0%, #F0FDF4 100%)',
        'card-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-lg': '24px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(124, 58, 237, 0.2)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "neu-press": "fade-in 0.15s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
