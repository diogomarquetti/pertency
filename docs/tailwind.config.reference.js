/**
 * Pertency — referência de configuração Tailwind
 *
 * Isto NÃO é para rodar agora — é a receita para quando o Claude Code
 * inicializar o projeto Next.js real. A ideia: o Tailwind não guarda os
 * valores de cor/espaçamento diretamente — ele aponta para as variáveis
 * CSS de tokens.css, que continuam sendo a única fonte de verdade.
 *
 * Passo a passo real, na hora de montar o projeto:
 * 1. `npx create-next-app@latest` com Tailwind ativado
 * 2. Colar o conteúdo de tokens.css em app/globals.css (dentro de :root)
 * 3. Colar este arquivo (adaptado) como tailwind.config.ts
 * 4. `npx shadcn@latest init` — apontar os componentes para consumir
 *    as mesmas classes (bg-brand, text-ink, rounded-lg, etc.)
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:         'var(--bg)',
        surface:    'var(--surface)',
        ink:        'var(--ink)',
        muted:      'var(--muted)',
        line:       'var(--line)',
        brand: {
          DEFAULT: 'var(--brand)',
          tint:    'var(--brand-tint)',
          ink:     'var(--brand-ink)',
        },
        blue: {
          100: 'var(--blue-100)',
          500: 'var(--blue-500)',
          700: 'var(--blue-700)',
          900: 'var(--blue-900)',
        },
        navy: 'var(--navy-bg)',
      },
      borderRadius: {
        sm:   'var(--r-sm)',
        md:   'var(--r-md)',
        lg:   'var(--r-lg)',
        full: 'var(--r-full)',
      },
      fontFamily: {
        sans:     ['var(--font-sans)'],
        logotype: ['var(--font-logotype)'], // uso exclusivo no wordmark
      },
      spacing: {
        // grade de 8px, confirmada — ver tokens.json > spacing ($status: done)
        1: 'var(--space-1)', 2: 'var(--space-2)', 3: 'var(--space-3)',
        4: 'var(--space-4)', 5: 'var(--space-5)', 6: 'var(--space-6)',
        8: 'var(--space-8)', 10: 'var(--space-10)', 12: 'var(--space-12)',
        16: 'var(--space-16)', 20: 'var(--space-20)', 24: 'var(--space-24)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        enter:    'var(--ease-enter)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
    },
  },
  plugins: [],
};
