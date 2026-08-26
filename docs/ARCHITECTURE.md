# Pertency — Decisões de arquitetura do Design System

> Documento de handoff. Objetivo: quando o projeto real for inicializado com Claude Code,
> este arquivo resume as decisões já tomadas, para não precisar redecidir nada do zero.

## ⚠️ Como levar este contexto para o Claude Code

O Claude Code **não lê automaticamente** o conhecimento deste projeto do claude.ai — são
sistemas de contexto isolados hoje. O caminho manual, na hora de inicializar o repositório real:

1. Baixar este arquivo, `tokens.json`, `tokens.css` e `tailwind.config.reference.js` e colocá-los
   na pasta do projeto local (ex: raiz do repo ou `/docs`).
2. Rodar `/init` no Claude Code — ele gera um `CLAUDE.md` a partir da análise do projeto.
3. Pedir explicitamente para o Claude Code incorporar o conteúdo deste `ARCHITECTURE.md`
   dentro do `CLAUDE.md` (ou referenciá-lo via link, já que `CLAUDE.md` pode apontar para
   outros arquivos Markdown que são puxados automaticamente para o contexto).
4. Dali em diante, o Claude Code lê `CLAUDE.md` automaticamente a cada sessão nova —
   é o equivalente, do lado dele, ao "conhecimento do projeto" que temos aqui no claude.ai.

## Stack

- **Framework**: Next.js (React), App Router
- **Deploy**: Vercel
- **Backend**: Supabase
- **Versionamento**: Git
- **CSS**: Tailwind CSS, configurado para ler as variáveis de `tokens.css` (ver `tailwind.config.reference.js`)
- **Componentes base**: shadcn/ui — instalado via CLI, componentes vivem no repositório como código editável (não é dependência de pacote fechado)
- **Ícones**: Lucide (`lucide-react`)
- **Fontes**: Inter (interface/produto) via next/font ou Google Fonts. Dongle é uso EXCLUSIVO do wordmark da marca — nunca em componentes de UI.

## Estrutura de pastas (decidida)

Padrão simples do ecossistema shadcn/ui — **sem** nomenclatura formal de atomic design:

```
/app              → páginas e rotas (App Router)
/components/ui    → componentes-base gerados pelo shadcn (botão, input, etc.)
/components        → componentes compostos específicos do produto
/lib               → utilitários, clientes (ex: supabase client), hooks
/app/globals.css   → import dos tokens (conteúdo de tokens.css dentro de :root)
```

Decisão explícita: **não** usar pastas `atoms/molecules/organisms/templates/pages`. O raciocínio de atomic design (átomo → molécula → organismo → template → página) continua útil como forma de pensar a composição das telas, mas não vira estrutura literal de diretórios — para evitar fricção de categorização sem ganho real.

## Ponte tokens → Tailwind

`tokens.json` é a fonte de verdade estruturada (com flags `$status: done | draft` por grupo).
`tokens.css` é a mesma informação em CSS custom properties, com os MESMOS nomes de variável
já usados no brandbook (`--brand`, `--ink`, `--r-lg`, etc.) — compatível por cópia direta em
qualquer protótipo HTML feito no Claude.ai.

Fluxo de mudança: qualquer ajuste de token nasce em `tokens.json` → propaga para `tokens.css` →
o Tailwind já reflete automaticamente, porque `tailwind.config` referencia `var(--nome)`, nunca
valores fixos duplicados.

## Fluxo de trabalho (prototipagem → produção)

1. Protótipo de tela/fluxo é explorado como HTML no Claude.ai, usando `tokens.css` colado no `<style>`.
2. Quando validado, o Claude Code traduz o HTML/CSS já aprovado em componentes React reais,
   usando os componentes shadcn como base e as mesmas variáveis de token — sem redecidir
   valores visuais nesse momento, só estrutura/comportamento do componente.

## Status das camadas de token (ver tokens.json para detalhe)

| Camada | Status |
|---|---|
| Cor | ✅ Confirmado |
| Tipografia (fontes + escala) | ✅ Confirmado |
| Raio de canto | ✅ Confirmado |
| Ícones (biblioteca) | ✅ Confirmado — Lucide |
| Espaçamento (grade 8px) | ✅ Confirmado |
| Sombra/elevação | ✅ Confirmado |
| Movimento (duração/easing) | 🟡 Draft — ainda não validado |

## Próximos passos do design system (nesta ordem)

1. ~~Extrair tokens do brandbook~~ ✅
2. Construir guia de componentes vivo (HTML, no Claude.ai) — botão, input, card, badge, tabela, etc.
3. Validar decisão de movimento (duração/easing) — hoje draft
4. Inicializar o repositório real quando o guia de componentes estiver maduro o suficiente
   para servir de especificação

## Implementação real (registrado em 2026-08-26)

O projeto foi inicializado com Next.js 16 (App Router, TypeScript, Tailwind v4) + pnpm.

- **Tokens**: o conteúdo de `tokens.css` foi colado em `app/globals.css` (dentro de `:root`),
  precedido por `@import "tailwindcss";` e `@config "../tailwind.config.ts";` — necessário no
  Tailwind v4 para que o arquivo de config legado (`tailwind.config.ts`, adaptado de
  `tailwind.config.reference.js`) seja respeitado.
- **Fonte**: o ambiente desta sessão também não tem acesso a `fonts.googleapis.com`, então
  `next/font/google` (Inter) falhava no build. Por ora, `--font-sans` em `app/globals.css` usa
  a pilha declarada em `tokens.css` (`'Inter', -apple-system, ... sans-serif`) sem carregamento
  via next/font — funciona onde o usuário já tiver Inter instalada e cai para a fonte de
  sistema nos demais casos. Trocar por `next/font/google` (como o `ARCHITECTURE.md` original
  sugeria) assim que o ambiente de build tiver rede para o Google Fonts, ou usar
  `next/font/local` com os arquivos da fonte auto-hospedados.
- **shadcn/ui**: o ambiente desta sessão não tem acesso de rede a `ui.shadcn.com` (allowlist
  de egress do sandbox), então `shadcn init`/`add` não puderam ser executados. Em vez disso,
  os componentes-base foram criados manualmente em `/components/ui` (button, input, textarea,
  label, badge, card, form) seguindo a mesma estrutura de código que o CLI geraria (style
  "new-york", cva para variantes, Radix primitives), mas consumindo diretamente as classes do
  design system do projeto (`bg-brand`, `text-ink`, `border-line`, `rounded-md`, etc.) em vez
  dos tokens genéricos padrão do shadcn (`bg-primary`, `bg-muted`, etc.) — exatamente como
  pedido acima ("apontar os componentes para consumir as mesmas classes"). `components.json`
  foi criado normalmente, então `pnpm dlx shadcn@latest add <componente>` deve funcionar a
  partir de uma máquina com acesso a `ui.shadcn.com` (pode ser necessário ajustar os novos
  componentes para usar as classes do projeto, já que virão com os tokens padrão do shadcn).
- **Supabase**: clientes em `/lib/supabase/client.ts` (browser) e `/lib/supabase/server.ts`
  (Server Components/Actions), usando `@supabase/ssr`, padrão App Router.
