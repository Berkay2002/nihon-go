// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--primary)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--background)"
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--background)"
        },
        destructive: {
          DEFAULT: "var(--nihongoError)",
          foreground: "var(--background)"
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--mediumContrast)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--background)"
        },
        popover: {
          DEFAULT: "var(--background)",
          foreground: "var(--foreground)"
        },
        card: {
          DEFAULT: "var(--background)",
          foreground: "var(--foreground)"
        },
        // Text contrast levels
        "high-contrast": "var(--highContrast)",
        "medium-contrast": "var(--mediumContrast)",
        "low-contrast": "var(--lowContrast)",
        // NihonGo custom colors
        nihongo: {
          red: "var(--nihongoRed)",
          blue: "var(--nihongoBlue)",
          gold: "var(--nihongoGold)",
          green: "var(--nihongoGreen)",
          error: "var(--nihongoError)",
          text: "var(--highContrast)",
          lightGray: "#F7FAFC",
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        'bounce-light': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-scale': 'pulse-scale 2s infinite ease-in-out',
        'bounce-light': 'bounce-light 2s infinite ease-in-out'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        japanese: ['"Noto Sans JP"', 'sans-serif'],
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;