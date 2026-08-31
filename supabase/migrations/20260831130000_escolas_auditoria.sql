-- Auditoria de Escola — mesmo padrão de mantenedoras_auditoria/usuarios_auditoria, cobrindo
-- os campos sensíveis listados na regra 24 / critério 6 de docs/requisitos/cadastro-escola.md
-- (status, direção, coordenação, e-mail institucional, NRE vinculado).

create table public.escolas_auditoria (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas(id) on delete cascade,
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  alterado_por uuid references public.usuarios(id),
  alterado_em timestamptz not null default now()
);

-- escolas.id já É o escola_id do tenant, então dá pra comparar direto com get_escola_id() —
-- não precisa do EXISTS/join que mantenedoras_auditoria_select_admin usa.
create policy "escolas_auditoria_select_admin"
  on public.escolas_auditoria for select
  using (escola_id = public.get_escola_id() and public.get_user_role() = 'administrador');

create or replace function public.audit_escolas_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.escolas_auditoria (escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'status', old.status, new.status, auth.uid());
  end if;

  if new.diretor_nome is distinct from old.diretor_nome then
    insert into public.escolas_auditoria (escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'diretor', old.diretor_nome, new.diretor_nome, auth.uid());
  end if;

  if new.coordenador_nome is distinct from old.coordenador_nome then
    insert into public.escolas_auditoria (escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'coordenador', old.coordenador_nome, new.coordenador_nome, auth.uid());
  end if;

  if new.email_institucional is distinct from old.email_institucional then
    insert into public.escolas_auditoria (escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'email_institucional', old.email_institucional, new.email_institucional, auth.uid());
  end if;

  if new.nre_referencia is distinct from old.nre_referencia then
    insert into public.escolas_auditoria (escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'nre_referencia', old.nre_referencia, new.nre_referencia, auth.uid());
  end if;

  return new;
end;
$$;

create trigger trg_escolas_audit
  after update on public.escolas
  for each row
  execute function public.audit_escolas_changes();
