-- Rastreia se o usuário já definiu a própria senha alguma vez — usado por
-- /redefinir-senha pra decidir entre o texto de "primeiro acesso" (convite)
-- e o de "esqueci minha senha" (recovery).
--
-- Não dá pra usar o `type` (invite/recovery) do link da Supabase Auth pra
-- essa decisão: a única forma real de um usuário novo receber acesso é o
-- botão "Gerar link" do admin (gerarLinkAcesso, app/(app)/usuarios/actions.ts),
-- que sempre gera um link `recovery` — o link `invite` criado internamente
-- na hora do cadastro nunca chega a ser mostrado nem enviado pra ninguém.

alter table public.usuarios
  add column senha_definida boolean not null default false;

-- Backfill: qualquer usuário que já tenha feito login alguma vez (segundo
-- auth.users.last_sign_in_at) já passou por essa etapa antes desta coluna
-- existir — não deve ver a tela de primeiro acesso de novo.
update public.usuarios u
set senha_definida = true
from auth.users a
where a.id = u.id
  and a.last_sign_in_at is not null;
