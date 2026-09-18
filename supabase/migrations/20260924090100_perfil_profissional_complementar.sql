-- Onda 4 (fatia 2) — Perfil profissional complementar.
-- HU-EST-001 v2.0, papel "Profissional complementar" (linha 66) / CA09:
-- contribui e edita somente a própria contribuição (não exclui — CA09 só
-- fala em editar; remover continua exclusivo de administrador/secretaria/
-- coordenação, via avaliacao_contribuicoes_write_staff já existente).
-- Policies aditivas — não tocam nas já existentes (múltiplas policies
-- permissivas em Postgres se somam com OR).
create policy "avaliacao_contribuicoes_insert_autor" on public.avaliacao_contribuicoes
  for insert with check (
    escola_id = public.get_escola_id()
    and public.get_user_role() = 'profissional_complementar'
    and profissional_id = auth.uid()
  );

create policy "avaliacao_contribuicoes_update_autor" on public.avaliacao_contribuicoes
  for update using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = 'profissional_complementar'
    and profissional_id = auth.uid()
  )
  with check (
    escola_id = public.get_escola_id()
    and public.get_user_role() = 'profissional_complementar'
    and profissional_id = auth.uid()
  );
