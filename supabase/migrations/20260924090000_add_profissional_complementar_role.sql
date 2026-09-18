-- Onda 4 (fatia 2) — Perfil profissional complementar.
-- Precisa estar sozinho neste arquivo: Postgres não deixa usar um valor de
-- enum recém-adicionado (nem em `create policy` que o referencia) na mesma
-- transação do `add value`, e `supabase db push` aplica cada migration como
-- uma transação própria.
alter type public.user_role add value 'profissional_complementar';
