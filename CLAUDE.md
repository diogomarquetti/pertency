@AGENTS.md

# Pertency

Sistema para gestão e planejamento de estudantes nas APAEs.

@docs/ARCHITECTURE.md

## Stack

- Next.js 16 (App Router) + TypeScript, gerenciado com **pnpm**
- Tailwind CSS v4, configurado via `tailwind.config.ts` (compat mode, carregado com
  `@config "../tailwind.config.ts";` em `app/globals.css`) — as cores/raio/espaçamento/sombra
  do tema apontam para variáveis CSS definidas em `app/globals.css` (`--brand`, `--ink`,
  `--r-md`, etc.), nunca valores fixos. Fonte de verdade dos tokens: `docs/tokens.json` /
  `docs/tokens.css`.
- shadcn/ui — componentes-base em `components/ui` (ver nota em `docs/ARCHITECTURE.md` sobre
  terem sido criados manualmente, e não via `shadcn init`, por restrição de rede do ambiente
  em que o projeto foi inicializado)
- Supabase (`@supabase/supabase-js` + `@supabase/ssr`) — clientes em `lib/supabase/client.ts`
  (browser) e `lib/supabase/server.ts` (server)
- Formulários: `react-hook-form` + `zod` + `@hookform/resolvers`
- Máscaras de input: `react-imask`
- Ícones: `lucide-react`

## Estrutura

```
/app              → páginas e rotas (App Router)
/components/ui    → componentes-base (shadcn-style)
/components        → componentes compostos específicos do produto
/lib               → utilitários, clientes (ex: supabase), hooks
/docs              → tokens.json, tokens.css, tailwind.config.reference.js, ARCHITECTURE.md
```

Sem pastas `atoms/molecules/organisms` — decisão explícita, ver `docs/ARCHITECTURE.md`.

## Comandos

```
pnpm dev      # ambiente de desenvolvimento
pnpm build    # build de produção
pnpm lint     # eslint
```

## Variáveis de ambiente

`.env.local` (não versionado) precisa de `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_ANON_KEY` — pegar em Supabase > Project Settings > API.

## Convenções

- Nunca redefinir valores de design token localmente num componente — qualquer ajuste visual
  nasce em `docs/tokens.json`/`docs/tokens.css` e propaga a partir daí.
- Componentes-base (`components/ui`) devem consumir as classes do design system do projeto
  (`bg-brand`, `text-ink`, `border-line`, `rounded-md`, etc.), não os tokens genéricos padrão
  do shadcn (`bg-primary`, `bg-muted`, etc.).
- A fonte `Dongle` é de uso exclusivo no wordmark da marca — nunca em UI de produto.
