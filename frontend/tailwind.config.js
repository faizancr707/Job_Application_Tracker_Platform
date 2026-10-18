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
        /* ── Core Palette: Burnt Orange, Warm Ivory, Lime Green ── */
        'burnt-orange': {
          DEFAULT: '#CC5500',
          hover: '#B34700',
          light: '#FFF0E6',
          dim: '#E66914',
          dark: '#993D00',
        },
        'warm-ivory': {
          DEFAULT: '#FFF8E7',
          light: '#FFFDF7',
          dark: '#F5E8CB',
          muted: '#EADCB8',
        },
        'lime-green': {
          DEFAULT: '#A4D65E',
          dark: '#4A7C15',
          light: '#F2F9E8',
          dim: '#88C23C',
        },
        charcoal: {
          DEFAULT: '#29251F',        // Dark Charcoal
          muted: '#49443C',          // Warm Charcoal
          dim: '#71695E',            // Muted Brown-Gray
        },

        /* ── Typography Color System Tokens ── */
        'deep-brown': '#713000',          // H1 and H2 headings
        'dark-charcoal': '#29251F',       // Section & Card headings
        'warm-charcoal': '#49443C',       // Paragraphs and body text
        'muted-brown': '#71695E',         // Secondary text
        'deep-green': '#356B16',          // Success messages
        'soft-ivory': '#D6D0C4',          // Dark mode body paragraphs
        'burnt-orange-link': '#A84300',   // Links

        /* ── Semantic Mappings to Palette Tokens ── */
        night: {
          DEFAULT: '#FFF8E7',        // Base canvas is Warm Ivory
          deep: '#F7EED8',           // Deeper ivory section
          lighter: '#FFFDF7',        // Light ivory
        },
        electric: {
          DEFAULT: '#CC5500',        // Primary actions are Burnt Orange
          soft: '#E66914',
          dim: '#B34700',
        },
        'cyan-neon': {
          DEFAULT: '#356B16',        // Deep Green text for success/highlights
          accent: '#A4D65E',         // Vibrant Lime Green
          dim: '#356B16',
        },
        cloud: '#29251F',            // Section & Card headings (Dark Charcoal)
        beige: {
          DEFAULT: '#49443C',        // Body text (Warm Charcoal)
          dim: '#71695E',            // Secondary text (Muted Brown-Gray)
          muted: '#71695E',
        },
        terracotta: {
          DEFAULT: '#C0392B',
          dim: '#9E2A1E',
        },

        /* ── Surfaces ── */
        surface: {
          DEFAULT: '#FFFFFF',        // Card surfaces are crisp White
          hover: '#FAF4E8',          // Warm Ivory hover tint
        },

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
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(43, 30, 22, 0.05)',
        'warm-md': '0 4px 16px -2px rgba(43, 30, 22, 0.06), 0 2px 4px -1px rgba(43, 30, 22, 0.03)',
        'warm-lg': '0 10px 25px -3px rgba(43, 30, 22, 0.08), 0 4px 10px -2px rgba(43, 30, 22, 0.04)',
        'glow-orange': '0 0 20px rgba(204, 85, 0, 0.20)',
        'glow-orange-lg': '0 0 35px rgba(204, 85, 0, 0.30)',
        'glow-lime': '0 0 20px rgba(164, 214, 94, 0.25)',
        'glow-electric': '0 0 20px rgba(204, 85, 0, 0.20)',
        'glow-electric-lg': '0 0 35px rgba(204, 85, 0, 0.30)',
        'glow-cyan': '0 0 20px rgba(164, 214, 94, 0.25)',
        'glow-cyan-lg': '0 0 35px rgba(164, 214, 94, 0.35)',
        'glow-terracotta': '0 0 20px rgba(192, 57, 43, 0.20)',
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
          "0%, 100%": { boxShadow: "0 0 16px rgba(204, 85, 0, 0.15)" },
          "50%": { boxShadow: "0 0 32px rgba(204, 85, 0, 0.28)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}