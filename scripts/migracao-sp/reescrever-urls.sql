-- Migração para São Paulo (ver docs/migracao-sp.md) — troca o host do projeto
-- antigo pelo do novo nas URLs públicas de foto. `foto_url` guarda a URL
-- completa do Storage (getPublicUrl, em components/avatar-foto-editavel.tsx),
-- então sem isto as fotos continuariam vindo do projeto antigo e quebrariam
-- quando ele for desligado. São as únicas colunas com URL no schema.
--
-- Uso (no projeto NOVO, depois do restore):
--   psql "$NOVO_DB_URL" \
--     -v origem=https://wmxugjbqivihqzcumifi.supabase.co \
--     -v destino=https://<ref-novo>.supabase.co \
--     -f scripts/migracao-sp/reescrever-urls.sql
--
-- `session_replication_role = replica` desliga os triggers: trocar o host não
-- é uma alteração de cadastro, então não gera auditoria nem `updated_at` novo.

begin;
set local session_replication_role = replica;

update public.usuarios
set foto_url = replace(foto_url, :'origem', :'destino')
where foto_url like :'origem' || '/%';

update public.estudantes
set foto_url = replace(foto_url, :'origem', :'destino')
where foto_url like :'origem' || '/%';

commit;
