# Migração do banco para São Paulo

Roteiro para mover o Supabase do Pertency de `us-west-2` (Oregon) para `sa-east-1` (São
Paulo), junto com as funções da Vercel (`pdx1` → `gru1`). Na mesma migração o projeto muda de
dono: sai da conta pessoal (odiogomarquetti@gmail.com) e passa para a organização da
**Marquetti Labs** (conta labsmarquetti@gmail.com). O Supabase não muda a região de um
projeto existente: cria-se um projeto novo e copia-se tudo para ele
([guia oficial](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)).

**Por quê:** cada clique hoje viaja até Oregon (~170 ms só de ida a partir do Brasil). Com
banco e funções em São Paulo, isso cai para dezenas de milissegundos — e os dados de
estudantes passam a ficar no Brasil.

**Tamanho (inventário de 2026-11-05):** 40 tabelas/views, 23 logins, 21 arquivos (4,2 MB) em
3 buckets. A cópia em si leva minutos; o que toma tempo é a preparação.

**Efeito para quem usa:** todo mundo precisa entrar de novo **uma vez** (as chaves que assinam
as sessões mudam). Senhas continuam as mesmas — `auth.users` vai no dump com os hashes.

## O que vai e o que não vai no dump

| Item | Como migra |
|---|---|
| Schema e dados de `public` (tabelas, funções, RLS, triggers) | Dump/restore |
| Logins (`auth.users`, senhas, `senha_definida` etc.) | Dump/restore (dados de `auth`) |
| Buckets e linhas de `storage.objects` | Dump/restore — **sem os arquivos** |
| Arquivos do Storage | `pnpm migracao:storage` |
| Policies de `storage.objects` (15) e trigger `trg_auth_users_email_audit` em `auth.users` | `scripts/migracao-sp/auth-storage.sql` — o dump não leva objetos criados em `auth`/`storage` |
| `foto_url` (URL completa com o host do projeto) | `scripts/migracao-sp/reescrever-urls.sql` |
| Histórico de migrations (`supabase_migrations`) | Dump/restore à parte (passo 4.4), para `supabase db push` continuar funcionando |
| Configurações do painel (Auth, URLs, chaves JWT) | Manual (passo 2) |
| Variáveis da Vercel e região das funções | Manual + PR (passo 5) |

Não usamos Vault/pgsodium com segredos, Realtime, Database Webhooks, cron nem Edge Functions —
nada disso precisa ser migrado. Os links de acesso são montados pelo próprio app
(`/auth/confirm?token_hash=…`), então não dependem do host do Supabase.

## 1. Pré-requisitos (na máquina de quem roda)

- **Docker Desktop aberto** — `supabase db dump` roda o `pg_dump` num container.
- **psql 17** (o banco é Postgres 17; o instalado hoje é o 15): `brew install postgresql@17` e
  usar `/opt/homebrew/opt/postgresql@17/bin/psql` nos comandos abaixo.
- **Senha do banco do projeto atual** (Project Settings › Database; resetar se ninguém souber).
- **Connection strings** de cada projeto em *Connect*. Sem IPv6 na rede, usar a do
  **Session pooler** (a conexão direta é só IPv6). Nos comandos: `$ANTIGO_DB_URL` e `$NOVO_DB_URL`.
- Acesso aos dois projetos da Vercel (`pertency` e `pertency-admin`).

## 2. Preparar o projeto novo (pode ser dias antes)

1. Entrar no Supabase com a conta **labsmarquetti@gmail.com** e criar o projeto na
   organização da Marquetti Labs, em **South America (São Paulo) — `sa-east-1`**, Postgres 17.
   Guardar a senha do banco definida na criação.
2. **Organization › Team** (Marquetti Labs): convidar **odiogomarquetti@gmail.com** como
   membro (Owner ou Administrator) e aceitar o convite. A CLI desta máquina está logada nessa
   conta — sem o convite, `supabase link` no projeto novo (passo 5) não enxerga o projeto. O
   dump/restore e os scripts não dependem disso: usam connection string e service role key.
3. **Authentication › URL Configuration:** copiar exatamente do projeto atual o *Site URL* e a
   lista de *Redirect URLs*.
4. **Authentication › Sign In / Providers e demais telas de Auth:** conferido em 2026-11-05
   com `supabase config diff` (só leitura) contra uma config padrão em pasta temporária, nos
   dois projetos: Auth idêntico. Só o Storage difere — *image transformation* e *analytics*
   ligados no antigo, que o app não usa. Para repetir com a Management API: `pnpm migracao:auth`
   (precisa de token pessoal). Copiar no painel do novo o que tiver sido mudado do padrão (cadastro aberto ou fechado, confirmação de e-mail, tamanho
   mínimo de senha, duração da sessão, SMTP e modelos de e-mail, se houver).
5. **JWT Keys:** deixar uma chave **assimétrica (ES256)** como a atual. Sem isso `getClaims()`
   volta a ir à rede a cada requisição (ver ARCHITECTURE.md › Desempenho da navegação).
6. Anotar URL, anon key e service role key do projeto novo e preencher `.env.migracao`
   (não versionado):

   ```
   SUPABASE_ACCESS_TOKEN=...            # Account › Access Tokens — revogar ao final
   ORIGEM_PROJECT_REF=wmxugjbqivihqzcumifi
   DESTINO_PROJECT_REF=rftbkbpirieoymktwutn
   ORIGEM_SUPABASE_URL=https://wmxugjbqivihqzcumifi.supabase.co
   ORIGEM_SERVICE_ROLE_KEY=...
   DESTINO_SUPABASE_URL=https://rftbkbpirieoymktwutn.supabase.co
   DESTINO_SERVICE_ROLE_KEY=...
   ```

## 3. Ensaio (recomendado)

Rodar os passos 4.1 a 4.7 contra um **projeto descartável** em `sa-east-1`, apontar o
`.env.local` para ele e navegar pelo app localmente (login, estudante com foto, documento,
admin). Corrigir o que quebrar neste roteiro. Depois apagar o projeto descartável. Restaurar
duas vezes no mesmo projeto não funciona — o schema já existe na segunda vez.

## 4. Dia da virada

Fora do horário escolar, com as escolas avisadas. Durante a janela ninguém deve gravar nada no
projeto antigo: o que for gravado depois do dump não chega ao novo.

**4.1 Conferir o que o dump não leva** (no projeto atual — deve dar 15 e 1):

```bash
psql "$ANTIGO_DB_URL" -c "select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects'" -c "select count(*) from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal"
```

Se der diferente, alguém criou algo direto no painel: incluir em
`scripts/migracao-sp/auth-storage.sql` antes de seguir.

**4.2 Dump do projeto atual:**

```bash
supabase db dump --db-url "$ANTIGO_DB_URL" -f roles.sql --role-only
```

```bash
supabase db dump --db-url "$ANTIGO_DB_URL" -f schema.sql
```

```bash
supabase db dump --db-url "$ANTIGO_DB_URL" -f data.sql --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
```

(Na CLI v3 o flag é `--remote` em vez de `--db-url`.) Os três arquivos têm dados pessoais de
estudantes: gerar numa pasta fora do repositório e apagar ao final.

**4.3 Restore no projeto novo:**

```bash
psql --single-transaction --variable ON_ERROR_STOP=1 --file roles.sql --file schema.sql --command 'SET session_replication_role = replica' --file data.sql --dbname "$NOVO_DB_URL"
```

Erros conhecidos do guia oficial: permissão com `supabase_admin` → comentar no `schema.sql` as
linhas `ALTER ... OWNER TO "supabase_admin"`; grant de `cli_login_postgres` → comentar no
`roles.sql` a linha `GRANT "postgres" TO "cli_login_postgres"...`.

**4.4 Histórico de migrations:**

```bash
supabase db dump --db-url "$ANTIGO_DB_URL" -f history_schema.sql --schema supabase_migrations
```

```bash
supabase db dump --db-url "$ANTIGO_DB_URL" -f history_data.sql --use-copy --data-only --schema supabase_migrations
```

```bash
psql --single-transaction --variable ON_ERROR_STOP=1 --file history_schema.sql --file history_data.sql --dbname "$NOVO_DB_URL"
```

**4.5 Policies de storage e trigger de auth:**

```bash
psql --variable ON_ERROR_STOP=1 --file scripts/migracao-sp/auth-storage.sql --dbname "$NOVO_DB_URL"
```

**4.6 URLs das fotos:**

```bash
psql "$NOVO_DB_URL" -v ON_ERROR_STOP=1 -v origem=https://wmxugjbqivihqzcumifi.supabase.co -v destino=https://rftbkbpirieoymktwutn.supabase.co -f scripts/migracao-sp/reescrever-urls.sql
```

**4.7 Arquivos do Storage e conferência:**

```bash
pnpm migracao:storage
```

```bash
pnpm migracao:conferir
```

A conferência compara linhas de cada tabela, logins e arquivos por bucket, e confere que
nenhuma `foto_url` ficou com o host antigo. Só seguir com tudo ✓.

## 5. Apontar o app para o projeto novo

1. **Vercel, nos dois projetos** (`pertency` e `pertency-admin`), em Production, Preview e
   Development: trocar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
   `SUPABASE_SERVICE_ROLE_KEY`. O app usa as chaves no formato novo (Project Settings › API Keys):
   a **publishable** (`sb_publishable_…`) na anon e a **secret** (`sb_secret_…`) na service role
   — não as JWT legadas.
2. **PR com a região:** `vercel.json` → `"regions": ["gru1"]`, e atualizar a seção
   "Desempenho da navegação" do ARCHITECTURE.md (região do banco e das funções). O merge
   publica os dois apps já com as variáveis novas.
3. Conferir que o deploy saiu: `x-vercel-id` da resposta deve mostrar `gru1::gru1::…`.
4. **Local:** trocar as três variáveis no `.env.local`, `SUPABASE_DEV_PROJECT_REF` (seed) e
   rodar `supabase link --project-ref rftbkbpirieoymktwutn`.

## 6. Teste de fumaça (produção)

- App das escolas: login, Início, abrir um estudante com foto, baixar um documento, salvar
  uma alteração, gerar link de acesso de um usuário.
- Admin: login de operador, abrir uma escola, gerar link do administrador.
- Minha conta: trocar a própria foto (confere as policies de storage).

## 7. Volta atrás e desligamento

- **Volta atrás** (só faz sentido na janela): devolver as três variáveis antigas na Vercel,
  `vercel.json` para `pdx1`, e publicar. O que for gravado no projeto novo nesse meio-tempo
  se perde.
- **Projeto antigo** (na conta odiogomarquetti@gmail.com): pausar (não apagar) e manter 2 a 4
  semanas como cópia de segurança.
  Depois apagar — antes disso, apagar também os arquivos `.sql` do dump e o `.env.migracao`.
