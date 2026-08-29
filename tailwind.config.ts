/**
 * Pertency — configuração Tailwind
 *
 * O Tailwind não guarda os valores de cor/espaçamento diretamente — ele aponta
 * para as variáveis CSS de tokens.css (integradas em app/globals.css), que
 * continuam sendo a única fonte de verdade. Qualquer ajuste visual nasce em
 * tokens.json/tokens.css, nunca aqui.
 *
 * Baseado em docs/tailwind.config.reference.js (ver ARCHITECTURE.md).
 */
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        brand: {
          DEFAULT: "var(--brand)",
          tint: "var(--brand-tint)",
          ink: "var(--brand-ink)",
        },
        blue: {
          100: "var(--blue-100)",
          500: "var(--blue-500)",
          700: "var(--blue-700)",
          900: "var(--blue-900)",
        },
        navy: "var(--navy-bg)",
        // cores de feedback — draft, ver tokens.json > color.feedback
        danger: {
          DEFAULT: "var(--danger)",
          tint: "var(--danger-tint)",
          ink: "var(--danger-ink)",
        },
        success: {
          DEFAULT: "var(--success)",
          tint: "var(--success-tint)",
          ink: "var(--success-ink)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          tint: "var(--warning-tint)",
          ink: "var(--warning-ink)",
        },
        info: {
          DEFAULT: "var(--info)",
          tint: "var(--info-tint)",
          ink: "var(--info-ink)",
        },
        // escala neutra primitiva — draft, ver tokens.json > color.neutralScale
        neutral: {
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
        },
      },
      borderRadius: {
        xs: "var(--r-xs)", // draft, ver tokens.json > radiusExtra
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
        full: "var(--r-full)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        logotype: ["var(--font-logotype)"], // uso exclusivo no wordmark
      },
      fontSize: {
        // escala de tipografia — ver tokens.json > typography.scale ($status: done)
        title: ["var(--fs-title)", { lineHeight: "var(--lh-title)", fontWeight: "var(--fw-title)" }],
        subtitle: ["var(--fs-subtitle)", { lineHeight: "var(--lh-subtitle)", fontWeight: "var(--fw-subtitle)" }],
        highlight: ["var(--fs-highlight)", { lineHeight: "var(--lh-highlight)", fontWeight: "var(--fw-highlight)" }],
        body: ["var(--fs-body)", { lineHeight: "var(--lh-body)", fontWeight: "var(--fw-body)" }],
        caption: ["var(--fs-caption)", { lineHeight: "var(--lh-caption)", fontWeight: "var(--fw-caption)" }],
        // tipografia de controle — draft, ver tokens.json > typography.control
        control: ["var(--fs-control)", { lineHeight: "var(--lh-control)", fontWeight: "var(--fw-control)" }],
        label: ["var(--fs-label)", { lineHeight: "var(--lh-label)", fontWeight: "var(--fw-label)" }],
      },
      spacing: {
        // grade de 8px, confirmada — ver tokens.json > spacing ($status: done)
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
        20: "var(--space-20)",
        24: "var(--space-24)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        enter: "var(--ease-enter)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
