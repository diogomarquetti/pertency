-- "Quem pode retirar o estudante" deixa de ser texto livre e vira:
--   * duas flags em `estudantes` para os responsáveis já cadastrados (não
--     duplica nome/telefone — se o responsável mudar, a autorização acompanha);
--   * tabela `estudante_autorizados_retirada` para outras pessoas (nome,
--     vínculo, telefone).
-- O texto antigo era só dado de teste e não é migrado.
alter table public.estudantes
  add column responsavel_principal_pode_retirar boolean not null default true,
  add column segundo_responsavel_pode_retirar boolean not null default true;

alter table public.estudantes drop column quem_pode_retirar;

create table public.estudante_autorizados_retirada (
  id uuid primary key default gen_random_uuid(),
  estudante_id uuid not null references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  nome text not null,
  vinculo text not null,
  telefone text not null,
  created_at timestamptz not null default now()
);

create index estudante_autorizados_retirada_estudante_id_idx
  on public.estudante_autorizados_retirada (estudante_id);

-- Mesmas regras de `estudantes`: leitura pela escola (respeitando o acesso
-- restrito de professores/profissionais complementares), escrita só pela
-- equipe que edita o cadastro.
create policy "estudante_autorizados_retirada_select_same_escola"
  on public.estudante_autorizados_retirada
  for select using (
    escola_id = public.get_escola_id()
    and public.pode_ver_estudante_restrito(estudante_id)
  );

create policy "estudante_autorizados_retirada_write_staff"
  on public.estudante_autorizados_retirada
  using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  )
  with check (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

-- ---------------------------------------------------------------------------
-- Auditoria — vai pra `estudantes_auditoria` (mesma lista do histórico do
-- cadastro). Troca de telefone não é auditada; nome/vínculo sim.
-- ---------------------------------------------------------------------------
create or replace function public.audit_estudantes_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.situacao is distinct from old.situacao then
    insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'situacao', old.situacao, new.situacao, auth.uid());
  end if;

  if new.cpf is distinct from old.cpf then
    insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'cpf', old.cpf, new.cpf, auth.uid());
  end if;

  if new.tipo_documento_identificacao is distinct from old.tipo_documento_identificacao
    or new.numero_documento is distinct from old.numero_documento then
    insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (
      new.id, new.escola_id, 'documento_identificacao',
      concat_ws(' ', old.tipo_documento_identificacao, old.numero_documento),
      concat_ws(' ', new.tipo_documento_identificacao, new.numero_documento),
      auth.uid()
    );
  end if;

  if new.responsavel_principal_pode_retirar is distinct from old.responsavel_principal_pode_retirar then
    insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'responsavel_principal_pode_retirar',
      old.responsavel_principal_pode_retirar::text, new.responsavel_principal_pode_retirar::text, auth.uid());
  end if;

  if new.segundo_responsavel_pode_retirar is distinct from old.segundo_responsavel_pode_retirar then
    insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'segundo_responsavel_pode_retirar',
      old.segundo_responsavel_pode_retirar::text, new.segundo_responsavel_pode_retirar::text, auth.uid());
  end if;

  return new;
end;
$$;

create or replace function public.audit_estudante_autorizados_retirada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.estudante_id, new.escola_id, 'autorizado_retirada', null, concat_ws(' · ', new.nome, new.vinculo), auth.uid());
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.nome is distinct from old.nome or new.vinculo is distinct from old.vinculo then
      insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
      values (new.estudante_id, new.escola_id, 'autorizado_retirada',
        concat_ws(' · ', old.nome, old.vinculo), concat_ws(' · ', new.nome, new.vinculo), auth.uid());
    end if;
    return new;
  end if;

  -- DELETE: se veio do cascade da exclusão do próprio estudante, a linha pai
  -- já não existe e a FK de estudantes_auditoria derrubaria a exclusão (mesmo
  -- bug corrigido em 20260924090200_fix_auditoria_delete_fk.sql).
  if exists (select 1 from public.estudantes where id = old.estudante_id) then
    insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (old.estudante_id, old.escola_id, 'autorizado_retirada_removido', concat_ws(' · ', old.nome, old.vinculo), null, auth.uid());
  end if;
  return old;
end;
$$;

create trigger trg_estudante_autorizados_retirada_audit
  after insert or update or delete on public.estudante_autorizados_retirada
  for each row execute function public.audit_estudante_autorizados_retirada();
