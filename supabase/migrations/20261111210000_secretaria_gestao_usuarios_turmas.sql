-- Secretaria passa a ter acesso completo a Usuários e Turmas (matriz de
-- permissões revisada na demo de 2026-11-11). Ela não cria, edita, promove nem
-- remove contas de Administrador: isso continua só do administrador (e do
-- operador da plataforma), para que a secretaria não ganhe mais poder do que a
-- matriz prevê. Turnos, ano letivo e etapas seguem só do administrador.

-- Turmas e tudo que pende delas -------------------------------------------------

drop policy if exists turmas_write_admin on public.turmas;
create policy turmas_write_gestao on public.turmas for all
  using (escola_id = get_escola_id() and get_user_role() in ('administrador', 'secretaria'))
  with check (escola_id = get_escola_id() and get_user_role() in ('administrador', 'secretaria'));

drop policy if exists turma_componentes_write_admin on public.turma_componentes;
create policy turma_componentes_write_gestao on public.turma_componentes for all
  using (
    exists (select 1 from public.turmas t where t.id = turma_componentes.turma_id and t.escola_id = get_escola_id())
    and get_user_role() in ('administrador', 'secretaria')
  )
  with check (
    exists (select 1 from public.turmas t where t.id = turma_componentes.turma_id and t.escola_id = get_escola_id())
    and get_user_role() in ('administrador', 'secretaria')
  );

drop policy if exists turma_cronograma_write_admin on public.turma_cronograma;
create policy turma_cronograma_write_gestao on public.turma_cronograma for all
  using (
    exists (select 1 from public.turmas t where t.id = turma_cronograma.turma_id and t.escola_id = get_escola_id())
    and get_user_role() in ('administrador', 'secretaria')
  )
  with check (
    exists (select 1 from public.turmas t where t.id = turma_cronograma.turma_id and t.escola_id = get_escola_id())
    and get_user_role() in ('administrador', 'secretaria')
  );

drop policy if exists turmas_auditoria_select_admin on public.turmas_auditoria;
create policy turmas_auditoria_select_gestao on public.turmas_auditoria for select
  using (escola_id = get_escola_id() and get_user_role() in ('administrador', 'secretaria'));

-- Usuários --------------------------------------------------------------------

drop policy if exists usuarios_insert_admin on public.usuarios;
create policy usuarios_insert_gestao on public.usuarios for insert
  with check (
    escola_id = get_escola_id()
    and (get_user_role() = 'administrador' or (get_user_role() = 'secretaria' and funcao <> 'administrador'))
  );

drop policy if exists usuarios_update_admin on public.usuarios;
create policy usuarios_update_gestao on public.usuarios for update
  using (
    escola_id = get_escola_id()
    and (get_user_role() = 'administrador' or (get_user_role() = 'secretaria' and funcao <> 'administrador'))
  )
  with check (
    escola_id = get_escola_id()
    and (get_user_role() = 'administrador' or (get_user_role() = 'secretaria' and funcao <> 'administrador'))
  );

drop policy if exists usuarios_delete_admin on public.usuarios;
create policy usuarios_delete_gestao on public.usuarios for delete
  using (
    escola_id = get_escola_id()
    and (get_user_role() = 'administrador' or (get_user_role() = 'secretaria' and funcao <> 'administrador'))
  );

drop policy if exists auditoria_select_admin on public.usuarios_auditoria;
create policy auditoria_select_gestao on public.usuarios_auditoria for select
  using (
    exists (select 1 from public.usuarios u where u.id = usuarios_auditoria.usuario_id and u.escola_id = get_escola_id())
    and get_user_role() in ('administrador', 'secretaria')
  );

-- Vínculo professor ↔ turma ↔ componentes: só mexe em quem não é administrador
-- (a RLS de usuarios já esconde a escrita; aqui o vínculo segue a mesma regra).
drop policy if exists usuario_turmas_write_admin on public.usuario_turmas;
create policy usuario_turmas_write_gestao on public.usuario_turmas for all
  using (
    exists (select 1 from public.usuarios u where u.id = usuario_turmas.usuario_id and u.escola_id = get_escola_id())
    and get_user_role() in ('administrador', 'secretaria')
  )
  with check (
    exists (select 1 from public.usuarios u where u.id = usuario_turmas.usuario_id and u.escola_id = get_escola_id())
    and get_user_role() in ('administrador', 'secretaria')
  );

drop policy if exists usuario_turma_componentes_write_admin on public.usuario_turma_componentes;
create policy usuario_turma_componentes_write_gestao on public.usuario_turma_componentes for all
  using (
    exists (
      select 1 from public.usuario_turmas ut join public.usuarios u on u.id = ut.usuario_id
      where ut.id = usuario_turma_componentes.usuario_turma_id and u.escola_id = get_escola_id()
    )
    and get_user_role() in ('administrador', 'secretaria')
  )
  with check (
    exists (
      select 1 from public.usuario_turmas ut join public.usuarios u on u.id = ut.usuario_id
      where ut.id = usuario_turma_componentes.usuario_turma_id and u.escola_id = get_escola_id()
    )
    and get_user_role() in ('administrador', 'secretaria')
  );

-- Trigger: antes só administrador mudava função/status de alguém. A secretaria
-- pode, desde que a conta não seja (nem passe a ser) de Administrador e que a
-- escola não mude.
create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_user_role() <> 'administrador' then
    if new.escola_id is distinct from old.escola_id then
      raise exception 'Você não pode alterar função, status ou escola.';
    end if;
    if new.funcao is distinct from old.funcao or new.status is distinct from old.status then
      if public.get_user_role() <> 'secretaria'
         or old.funcao = 'administrador'
         or new.funcao = 'administrador'
         or old.id = auth.uid() then
        raise exception 'Você não pode alterar função, status ou escola.';
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- Foto do usuário: a secretaria também envia/remove (já era assim no bucket de
-- estudantes). O caminho continua preso à escola de quem envia.
drop policy if exists usuarios_fotos_insert_admin on storage.objects;
create policy usuarios_fotos_insert_gestao on storage.objects for insert
  with check (
    bucket_id = 'usuarios-fotos'
    and get_user_role() in ('administrador', 'secretaria')
    and (storage.foldername(name))[1] = get_escola_id()::text
  );

drop policy if exists usuarios_fotos_update_admin on storage.objects;
create policy usuarios_fotos_update_gestao on storage.objects for update
  using (
    bucket_id = 'usuarios-fotos'
    and get_user_role() in ('administrador', 'secretaria')
    and (storage.foldername(name))[1] = get_escola_id()::text
  );

drop policy if exists usuarios_fotos_delete_admin on storage.objects;
create policy usuarios_fotos_delete_gestao on storage.objects for delete
  using (
    bucket_id = 'usuarios-fotos'
    and get_user_role() in ('administrador', 'secretaria')
    and (storage.foldername(name))[1] = get_escola_id()::text
  );
