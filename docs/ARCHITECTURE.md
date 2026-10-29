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

## Banco de dados (registrado em 2026-08-26, Fase 0 do módulo Cadastro de Usuários)

O schema de dados do módulo de usuários/turmas já existia no projeto Supabase remoto — criado
fora deste repositório (provavelmente direto no dashboard/SQL editor), sem nenhuma migration
versionada até este ponto. Rodamos `supabase link` + `supabase db pull` para trazer isso pro
controle de versão: ver `supabase/migrations/20260826183829_remote_schema.sql` (dump completo
do schema — fonte de verdade a partir de agora; qualquer mudança de schema deve ser uma nova
migration, nunca edição manual no dashboard).

### Tabelas (schema `public`)

- `escolas` — stub temporário de tenancy (nome_oficial, status), a ser substituído por um
  módulo completo de Cadastro de Escola no futuro.
- `usuarios` — perfil funcional do usuário (Bloco 1 da história do Cadastro de Usuário).
  `id` é o mesmo UUID de `auth.users.id` (sem default — precisa ser passado explicitamente ao
  inserir, depois de criar o usuário de autenticação). `funcao` e `status` são enums Postgres
  tipados (`public.user_role`: administrador/direcao/secretaria/coordenacao_pedagogica/
  professor_regente/professor_arte/professor_educacao_fisica; `public.user_status`:
  ativo/inativo) — batem exatamente com os valores da história. Login/senha ficam em
  `auth.users`, não aqui.
- `usuarios_auditoria` — histórico de alterações (campo_alterado/valor_anterior/valor_novo).
- `etapas_ciclos`, `turnos`, `turmas` — dados de referência por escola, ainda vazios (nenhum
  módulo de Cadastro de Turmas/Escola existe ainda).
- `componentes_curriculares` — global (sem escola_id), já populado com os 7 componentes da
  história (Português, Matemática, Ciências, Geografia, História, Arte, Educação Física).
- `usuario_turmas` / `usuario_turma_componentes` — vínculo professor↔turma↔componentes
  (Bloco 2 da história).

### RLS e funções auxiliares

`get_user_role()` e `get_escola_id()` são funções `SECURITY DEFINER` que leem
`auth.uid()` e devolvem, respectivamente, `usuarios.funcao` e `usuarios.escola_id` da linha
correspondente ao usuário logado. **Consequência importante**: um usuário de `auth.users` sem
linha correspondente em `usuarios` fica com as duas funções retornando `null`, e toda política
de RLS que dependa delas bloqueia — inclusive leitura da própria escola. É por isso que criar
um novo usuário exige duas etapas em ordem (auth.users → usuarios), e por isso o bootstrap do
admin de teste é obrigatório antes de qualquer teste manual funcionar.

Todas as políticas de escrita (`*_write_admin`, `usuarios_insert_admin`, `usuarios_update_admin`,
`usuarios_delete_admin`) exigem `get_user_role() = 'administrador'` **e**
`escola_id = get_escola_id()`. Leitura é sempre escopada à mesma escola (`escola_id =
get_escola_id()`), exceto `componentes_curriculares` (qualquer usuário autenticado) e as
tabelas de vínculo (escopadas via join até `usuarios.escola_id`).

**Implicação prática para código de aplicação**: como admin, o client normal
(`lib/supabase/server.ts`, respeitando RLS) já consegue inserir/atualizar/deletar em
`usuarios`, `usuario_turmas`, `usuario_turma_componentes`, `turmas`, `turnos`, `etapas_ciclos`
— não é necessário bypassar RLS com a service role key para essas escritas. A service role só
é estritamente necessária para provisionar o usuário em `auth.users` (criar login/senha), que
não tem equivalente com a anon key.

### Auditoria já é automática (triggers existentes)

Não é preciso escrever `usuarios_auditoria` manualmente na aplicação — já existem triggers:

- `trg_usuarios_audit` (AFTER UPDATE em `usuarios`) → audita mudanças de `funcao` e `status`.
- `trg_auth_users_email_audit` (AFTER UPDATE OF email em `auth.users`) → audita troca de
  e-mail de login (`campo_alterado = 'email_login'`).
- `trg_usuario_turmas_audit_insert` / `trg_usuario_turmas_audit_delete` → auditam
  adição/remoção de vínculo de turma.
- `trg_usuarios_updated_at` mantém `usuarios.updated_at` automaticamente.

Isso cobre exatamente os 4 campos que a regra de negócio da história pede (função, status,
e-mail de login, vínculos de turma) — nada mais precisa ser adicionado na aplicação para
auditoria.

### `rls_auto_enable()`

Event trigger que habilita RLS automaticamente em qualquer tabela nova criada no schema
`public` — não precisa ser chamado manualmente, só existe para evitar esquecer de habilitar
RLS numa tabela futura.

## Storage — fotos de usuário (registrado em 2026-08-26, Bloco 4 do módulo Cadastro de Usuários)

Bucket `usuarios-fotos`, criado via migration (`supabase/migrations/20260826193900_usuarios_fotos_bucket.sql`),
**público de leitura** — fotos de profissionais não são dado sensível, e isso evita ter que lidar
com signed URLs expirando na UI. Escrita (insert/update/delete em `storage.objects`) é restrita
a administradores da própria escola, via política que compara o primeiro segmento do caminho do
arquivo com `get_escola_id()`.

Convenção de caminho: `{escola_id}/{usuario_id}.{ext}` (`ext` é `png` ou `jpg`, conforme o
`FileUpload` só aceita `image/png`/`image/jpeg`). Antes de cada upload, o client lista e remove
qualquer arquivo já existente com esse prefixo (`{escola_id}/{usuario_id}.*`) — evita ficar com
uma foto antiga órfã no bucket se o usuário trocar de PNG pra JPG (ou vice-versa) entre uploads.

O upload em si roda inteiramente no client ([`avatar-foto-editavel.tsx`](../components/avatar-foto-editavel.tsx),
compartilhado com a foto do estudante — bucket `estudantes-fotos`, mesma convenção de caminho),
direto contra `lib/supabase/client.ts` — sem server action, sem service role. Fica no avatar do
card de topo do cadastro (clicar na foto abre o seletor) e só existe na tela de edição (precisa
de `usuario_id`, que não existe até o cadastro ser salvo pela primeira vez). Depois de
cada upload/remoção bem-sucedida, o client já atualiza `usuarios.foto_url` diretamente — não
passa pelas server actions de `createUsuario`/`updateUsuario`, então trocar de foto nunca
bloqueia nem depende do resto do formulário ser salvo.

## Homepage de pendências — Início (registrado em 2026-10-27)

Requisito: `docs/requisitos/inicio-pendencias.md`. Protótipo aprovado:
`docs/prototipos/pertency-inicio.html`.

### Pendência é calculada na leitura, não guardada

Não existe tabela de pendências. Cada pendência é consequência do estado atual dos cadastros
e some sozinha quando o estado muda — não há o que "marcar como resolvido" nem job para
manter sincronizado. Tudo roda no servidor, com o client normal (`lib/supabase/server.ts`),
então **a RLS do usuário logado vale para tudo**: ninguém vê pendência de dado que não pode ler.

- `lib/pendencias/index.ts` — `getPendencias()` (em `cache()` do React, uma vez por
  requisição) devolve `{ usuario, resolver, acompanhar }` já ordenados (atrasada → atenção →
  normal; dentro da mesma severidade, a mais antiga primeiro). Só roda os tipos em que o
  perfil logado resolve ou acompanha, em `Promise.allSettled`: um tipo que falha é logado e
  some da lista, sem derrubar a página.
- `lib/pendencias/tipos/*.ts` — um arquivo por tipo (`TipoPendencia`): quem resolve, quem
  acompanha, a regra em texto (mostrada em "Por que estou vendo isto?"), prazo ou severidade
  fixa, e `carregar()`, que devolve as ocorrências.
- `lib/pendencias/registro.ts` — a lista dos tipos ativos.
- `lib/pendencias/fontes/*.ts` — consultas compartilhadas, também em `cache()`: uma consulta de
  "estudantes em ingresso" alimenta 5 tipos e a Fila de ingresso; o mesmo vale para turmas,
  documentos e cadastro institucional. Por isso o custo é por fonte, não por tipo nem por item.
- `lib/pendencias/perfis.ts` — mapa `usuarios.funcao` → perfil do catálogo
  (`coordenacao_pedagogica` → Pedagogo(a); os quatro papéis de professor → Professor(a)).

**Resolver × acompanhar:** se o perfil está em `resolve`, o item vai para "Para você resolver";
se está em `acompanha`, para "Acompanhar". Tipo com `porUsuario: true` (hoje só
`contribuicao_pendente`) só vai para "resolver" de quem é dono da ocorrência.

**Tipo novo** (ex.: PAI vencido): criar `lib/pendencias/tipos/<tipo>.ts`, uma fonte em
`fontes/` se precisar de consulta nova, e incluir o tipo em `registro.ts`. A homepage não muda.

### Regras provisórias num lugar só

Todos os prazos ficam em `lib/pendencias/prazos.ts` (e o limite de ocupação,
`OCUPACAO_ALERTA_PERCENTUAL`), marcados `// PROVISÓRIO: validar com P.O`. Tipo com prazo
provisório mostra a marca "PROVISÓRIO · validar prazo com P.O" na explicação da regra.
Outras regras provisórias ficam junto da regra compartilhada que já existia — ex.:
`documentosPendentes()` em `app/(app)/estudantes/documentos-schema.ts`, usada tanto pela aba
Documentos quanto pela homepage, para as duas nunca divergirem. Pela mesma razão,
`cadastro_institucional_incompleto` valida com os próprios `escolaSchema`/`mantenedoraSchema`
dos formulários de Configurações.

### Links da homepage

Cada pendência leva direto ao lugar de resolver: abas do estudante por `?aba=`
(`avaliacao`, `documentos`, `dados-escolares`, `condicao`), cards por âncora
(`#parecer`, `#contribuicoes`, `#professores`, `#acesso`, com `scroll-mt-2`) e listas filtradas
por `?pendencia=` (`/estudantes?pendencia=documentos`, `/turmas?pendencia=organizacao`).

### Coluna lateral por perfil

`lib/pendencias/paineis.ts` (`PAINEIS_POR_PERFIL`) e `components/inicio/coluna-lateral.tsx`:
Fila de ingresso (Secretaria, Pedagogo(a), Direção), Ocupação das turmas (Direção), Sua turma
(Professor(a)) e Configuração da escola (Administrador). Profissional complementar não tem
painel. Mesmo princípio dos tipos: um painel que falha some sozinho.

Dois painéis precisam de dados que a RLS de `vinculos_escolares_anuais` não libera para todos
os perfis (o professor não lê; a Direção também não lia até a migration
`20261028090000_vinculos_select_direcao.sql`, que corrigiu "Estudantes vinculados" vazio para
ela na tela da turma), então usam funções `SECURITY DEFINER` da migration
`supabase/migrations/20261027120000_inicio_rpcs.sql`, que devolvem só o necessário e sempre
escopadas a `get_escola_id()`:

- `ocupacao_turmas()` — só totais por turma ativa (ocupa vaga quem está Ativo com vínculo na
  turma), nenhum dado de estudante.
- `meus_estudantes_por_turma()` — estudantes Ativos das turmas em que `auth.uid()` tem vínculo
  ativo. Os alertas de rotina são lidos à parte, pela RLS normal de
  `perfil_funcional_estudante`, com o mesmo `montarAlertas()` do Perfil do Estudante
  (`app/(app)/estudantes/perfil-funcional-alertas.ts`) — nada clínico (sem CID nem diagnóstico).

### Fora do escopo por enquanto

- Itens adiados do catálogo: `dados_pessoais_incompletos` (o formulário já não salva estudante
  incompleto), ciência da família e `vaga_disputada` (a avaliação guarda oferta pretendida,
  não turma).
- Item 11 do catálogo foi substituído por `usuario_sem_primeiro_acesso`
  (`usuarios.senha_definida = false`).
- Sino de notificações: ver a seção "Notificações do sino" abaixo.

### Seed de desenvolvimento

`pnpm seed:pendencias` (`scripts/seed-pendencias-dev.ts`) monta a "Escola Especializada
Caminhos" do protótipo, com um usuário por perfil (`@caminhos.pertency.test`) e um caso para
cada tipo de pendência e painel. É uma escola à parte — como toda a RLS é por escola, nada dela
aparece para outras escolas — e sai inteira com `pnpm seed:pendencias --reset`. O script
recusa rodar sem `PERTENCY_ALLOW_SEED=1`, `SUPABASE_DEV_PROJECT_REF` batendo com a URL do
Supabase e `SEED_DEV_PASSWORD` no `.env.local`, e recusa em `NODE_ENV`/`VERCEL_ENV` de
produção. Hoje roda no próprio projeto Pertency (não existe projeto de dev separado).

## Notificações do sino (registrado em 2026-10-28)

### Notificação é acontecimento; pendência é estado

A homepage responde "o que falta fazer" (calculado na leitura). O sino responde "o que
aconteceu que muda o meu trabalho": alguém fez algo que me diz respeito. Por isso, ao contrário
das pendências, notificação **é gravada** — na tabela `notificacoes`, por triggers no momento
do evento (`supabase/migrations/20261028100000_notificacoes.sql` e
`20261028100100_notificacoes_turma_anula.sql`). Quem recebe é decidido no trigger, porque boa
parte das tabelas de origem (vínculos anuais, perfil funcional, auditorias) não é legível pelo
destinatário via RLS.

Regras gerais, todas na função `notificar()`:

- quem fez a ação nunca é notificado (`auth.uid()`); só recebe usuário ativo da mesma escola;
- uma notificação não lida do mesmo tipo e do mesmo registro é agrupada (`quantidade` + 1,
  volta ao topo) em vez de duplicar — ex.: "3 novas contribuições";
- `dados` guarda só nomes curtos (estudante, turma, profissional), nunca conteúdo clínico nem o
  texto do alerta; o detalhe fica na tela de destino, onde a RLS de quem clica vale normalmente.

RLS: cada usuário lê só as próprias; `insert`/`delete` não existem para `authenticated` e o
`update` só alcança a coluna `lida_em` (grant por coluna). As funções auxiliares não são
executáveis pelo client.

### Tipos (Onda 1)

| Tipo | Quem recebe | Evento |
|---|---|---|
| `alerta_rotina_atualizado` | Professores da turma do estudante Ativo | Alergia, medicação, situação de atenção ou segurança mudou no perfil funcional |
| `estudante_entrou_turma` / `estudante_saiu_turma` | Professores da turma | Turma do vínculo anual mudou; ou estudante Ativo virou transferido/desligado/inativo. Entrada e saída não lidas do mesmo estudante se anulam |
| `vinculado_turma` | O professor vinculado | Vínculo ativo em `usuario_turmas` |
| `incluido_equipe_avaliacao` | Profissional complementar que entrou na equipe | `equipe_responsavel_ids` de avaliação em rascunho/andamento (retificação herda a equipe: só avisa quem entrou) |
| `contribuicao_registrada` → `contribuicoes_completas` | Pedagogo(a) da equipe (sem nenhum na equipe, todos da escola) — PROVISÓRIO | Contribuição registrada; a última dos complementares da equipe vira "Pronta para o parecer" e substitui a anterior não lida |
| `avaliacao_concluida` | Secretaria e quem da equipe lê a avaliação (não professor) | Status passou a Concluída (texto diz elegível / não elegível) |

### Texto e UI

Texto curto, de bater o olho: um título de poucas palavras e o sujeito (estudante ou turma),
mais o tempo ("há 2 h"). O texto mora em `lib/notificacoes/tipos.ts` (o banco guarda só o tipo);
título e linha de sujeito são truncados em uma linha cada. `lib/notificacoes/index.ts`
(`getNotificacoes()`, em `cache()`) lê os últimos `JANELA_DIAS` (30, PROVISÓRIO) até
`LIMITE_ITENS`; tipo desconhecido é ignorado e erro devolve vazio — o sino nunca derruba o layout.

`components/layout/notificacoes-menu.tsx`: o ponto vermelho indica **notificação não lida**
(não mais pendência). Como o layout não re-renderiza ao trocar de página, o menu recarrega via
server action (`carregarNotificacoes`) a cada navegação e ao abrir. Clicar marca como lida e
leva ao destino; "Marcar todas como lidas" no topo.

**Tipo novo:** um trigger que chama `notificar()` (nova migration) e uma entrada em
`lib/notificacoes/tipos.ts`.

Fora do escopo por enquanto: e-mail/push/WhatsApp, tempo real, preferências por usuário,
limpeza automática das antigas, e a Onda 2 (retificação/cancelamento de avaliação, primeiro
acesso concluído, mudança da própria função/turmas, resumo de situação para a Direção,
pendência que ficou atrasada).

O seed (`pnpm seed:pendencias`) grava 5 exemplos na primeira vez (Professor, Profissional
complementar, Pedagoga e Secretaria; Direção e Administrador ficam com o estado vazio) e o
`--reset` apaga `notificacoes` junto com o resto.

## Ofertas com código SERE no cadastro da turma (registrado em 2026-10-29)

A turma escolhe a **oferta SERE** (`turmas.oferta_sere`: 6005, 6046, 6036, 6053, 6039, 6054,
5110), exibida como "Nome (código)". `turmas.oferta_id` continua sendo o grupo (`ofertas.slug`:
ei, ef, eja, aee_infantil, curriculo_funcional), que o resto do sistema usa (avaliação, dados
escolares, vínculo de professor). As regras de cada oferta SERE — organizações permitidas e
forma de funcionamento (diária, cronograma ou livre) — ficam em `OFERTAS_SERE`, em
`lib/ofertas-config.ts` (migration `20261029090000_ofertas_sere.sql`).

PROVISÓRIO (validar com P.O): 6005 e 6046 têm as duas organizações da Educação Infantil; 6036 e
5110 têm organização única de mesmo nome e ainda não têm estrutura curricular (matriz opcional,
bloco 3 só com aviso). Turma antiga da Educação Infantil fica sem `oferta_sere` e precisa
escolher 6005 ou 6046 na próxima edição.

## Admin da plataforma — operadores e mantenedora (registrado em 2026-10-29)

Os donos do Pertency vão ter um admin próprio (`admin.pertency.com.br`) para cadastrar
mantenedoras, escolas e o primeiro usuário administrador de cada escola. É o mesmo
repositório, publicado num segundo projeto da Vercel (ver "Admin da plataforma — app e
deploy" abaixo). Banco:

- **Operador da plataforma** (`operadores_plataforma` + `is_operador()`, migration
  `20261029120000_operadores_plataforma.sql`): não tem linha em `usuarios`, então nenhuma
  política de escola o alcança. O acesso dele vem só das políticas `*_operador` (escolas,
  mantenedoras, usuários e as auditorias dessas três). Uma conta é operador **ou** usuário
  de escola, nunca as duas (trigger nos dois lados): senão o admin da escola poderia trocar
  o login ou gerar link de acesso para a conta do operador. O primeiro operador nasce por
  script: `pnpm bootstrap:operador <email> "<nome>" [--origin <url>]`.
- **Autoria na auditoria**: `alterado_por` tem FK para `usuarios` (usada nos históricos via
  `usuarios!..._alterado_por_fkey`). Quando quem altera é operador, um trigger BEFORE INSERT
  move o id para `alterado_por_operador` (em `escolas_auditoria`, `mantenedoras_auditoria`,
  `usuarios_auditoria`).
- **A escola seleciona a mantenedora** (`escolas.mantenedora_id`, migration
  `20261029120100_escola_seleciona_mantenedora.sql`); `mantenedoras.escola_id` deixou de
  existir, e uma mantenedora pode manter várias escolas. Só o operador cria mantenedora e
  troca a mantenedora da escola (trigger). Em Configurações, sem mantenedora vinculada o card
  diz que a equipe Pertency faz esse cadastro.
- **Transitório**: `escolas_update_admin` e `mantenedoras_update_admin` ainda deixam o
  administrador da escola editar a escola e a mantenedora vinculada. Saem quando o admin da
  plataforma estiver no ar (junto com a pendência `cadastro_institucional_incompleto`).

## Admin da plataforma — app e deploy (registrado em 2026-10-29)

**Onde mora o código:** `app/admin/` (login em `app/admin/login`, páginas protegidas em
`app/admin/(painel)`). No domínio do admin a URL não tem o prefixo: o proxy
(`lib/supabase/session.ts`) reescreve `/escolas` para `/admin/escolas`. No app das escolas,
`/admin/*` dá 404. `/auth/*` e `/redefinir-senha` são compartilhadas (link de acesso e
nova senha funcionam igual nos dois). Links e `redirect()` dentro do admin usam o caminho
sem prefixo (`/escolas`, `/login`).

**Qual app é qual:** em produção, `PERTENCY_APP` (`admin` ou `escolas`) decide sozinha —
um host forjado não abre o admin no deploy das escolas. Sem a variável (local), o host
`admin.*` decide: o mesmo `pnpm dev` serve `http://localhost:3000` (escolas) e
`http://admin.localhost:3000` (admin). O proxy olha `x-forwarded-host` antes de `host`
porque o `redirect()` de uma Server Action é buscado pelo Next num fetch interno para a
origem do servidor (Host `localhost`), com os headers originais.

**Acesso:** o layout de `(painel)` exige operador ativo (`getOperadorAtual()`, em
`lib/supabase/get-operador.ts`); sessão de outra conta vê "não tem acesso" com botão Sair.
`loginOperador` recusa e desloga quem não é operador; o login das escolas já recusava quem
não tem linha em `usuarios`. Os cookies de sessão são por domínio, então estar logado num
app não dá sessão no outro.

**Shell e login compartilhados:** `AppShell`/`AppSidebar`/`AppTopbar` recebem
`area: "escola" | "plataforma"` (navegação em `NAV_ITEMS_POR_AREA`; no admin não há sino
nem "Minha conta"). `LoginScreen` (`components/auth`) e `LoginForm` (recebe a Server Action
por prop) servem os dois logins.

**Deploy (Vercel):**
1. Projeto atual (escolas): adicionar `PERTENCY_APP=escolas`.
2. Novo projeto, importando o mesmo repositório: mesmas variáveis do Supabase
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
   e `PERTENCY_APP=admin`, e `PERTENCY_ESCOLAS_URL=https://<domínio do app das escolas>`
   (origem dos links de acesso gerados no admin); domínio `admin.pertency.com.br`.
3. DNS: `CNAME admin → cname.vercel-dns.com` (o valor exato aparece em Domains no projeto).
4. Primeiro operador: `pnpm bootstrap:operador <email> "<nome>" --origin https://admin.pertency.com.br`
   e abrir o link impresso para definir a senha.

## Admin da plataforma — Escolas e Mantenedoras (registrado em 2026-10-29)

`/escolas` e `/mantenedoras` no admin: lista (busca, tabela no desktop e `ListCard` no
mobile), criação e edição. Reaproveitam os mesmos `EscolaForm`/`MantenedoraForm` e cards de
Configurações — cada tela passa a própria Server Action em `salvar` (criação no admin
termina em `redirect` para a lista com `?criada=1`, que vira toast via
`useToastDeParametro`). A conversão linha ↔ formulário fica num lugar só,
`app/(app)/minha-escola/mapeamento.ts`, usado pelos dois lados.

- **Mantenedora da escola**: `mantenedoraId` é opcional no `escolaSchema` (Configurações não
  mostra nem grava) e obrigatório no admin via `escolaComMantenedoraSchema`. O bloco
  "4. Mantenedora" (`EscolaMantenedoraCard`) só aparece quando o form recebe `mantenedoras`.
  Mantenedora inativa não pode ser escolhida, mas continua aceita se já for a da escola.
- **CNPJ único** entre mantenedoras, checado na action (uma mantenedora serve várias
  escolas; duas fichas do mesmo CNPJ dividiriam as escolas).
- Guard das actions: `requireOperador()` (`lib/supabase/require-operador.ts`); quem barra
  de verdade é a RLS `*_operador`.

## Admin da plataforma — Usuários (registrado em 2026-10-29)

`/usuarios` no admin: lista de todos os usuários de todas as escolas (busca por nome/e-mail,
filtro por escola, selo "Sem primeiro acesso" quando `senha_definida = false`), criação e
edição. Serve sobretudo para criar o primeiro administrador de cada escola (a função já vem
como Administrador).

- **Lógica compartilhada**: criar (invite + insert, com compensação), editar (login em
  `auth.users` + linha em `usuarios`) e gerar link de acesso ficam em `lib/usuarios/acesso.ts`,
  usado pelas actions do app das escolas e do admin. Antes de usar a service role, o módulo
  confere pela RLS de quem chama que o usuário está visível — um admin de escola não gera link
  nem troca o login de conta de outra escola (nem de operador).
- **Telefone duplicado** é checado dentro da escola do usuário (`usuarioComTelefone` recebe
  `escolaId`, porque o operador lê todas as escolas).
- **Escola** é escolhida só na criação ("2. Escola"); na edição aparece só para leitura.
  Usuário criado por operador fica com `created_by = null` (a FK aponta para `usuarios`); a
  auditoria de status/função registra o operador em `alterado_por_operador`.
- **Formulário**: `UsuarioPlataformaForm` (`components/admin`) reaproveita `UsuarioHeroCard`,
  `DadosGeraisCard` e `AcessoCard` (que recebe a action de gerar link por prop). Sem foto (o
  upload é do admin da escola, pela RLS do bucket) e sem turmas vinculadas.
- **Link de acesso aponta para o app das escolas**, mesmo gerado no admin:
  `PERTENCY_ESCOLAS_URL` no deploy do admin; sem ela, o host da requisição sem o prefixo
  `admin.` (local: `admin.localhost:3000` → `localhost:3000`).
