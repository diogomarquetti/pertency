-- Cadastro de Estudante — Fase 4 (Aba 4: Dados escolares).
-- docs/requisitos/cadastro-estudante.md, seção 4. É aqui que o estudante
-- finalmente ganha turma — reaproveita o mesmo catálogo de ofertas,
-- organizações e turnos já usado pelo Cadastro de Turma.

create table public.dados_escolares (
  id uuid primary key default gen_random_uuid(),
  estudante_id uuid not null unique references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),

  -- Vínculo escolar
  data_ingresso date,
  data_matricula_efetiva date,
  forma_ingresso text check (forma_ingresso in ('processo', 'transferencia', 'encaminhamento', 'outro')),
  tipo_matricula text check (tipo_matricula in ('nova_matricula', 'rematricula', 'transferencia')),
  oferta_atual_id uuid references public.ofertas(id),
  organizacao_atual_id uuid references public.etapas_ciclos(id),
  etapa_do_ciclo text,
  turno_id uuid references public.turnos(id),
  turma_id uuid references public.turmas(id),
  matricula_interna text,
  utiliza_transporte boolean,

  -- Origem escolar
  rede_origem text,
  escola_origem text,
  historico_transferencia text,

  -- Encerramento
  data_encerramento date,
  motivo_encerramento text,

  -- Observações
  observacoes text,

  created_by uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_dados_escolares_updated_at
  before update on public.dados_escolares
  for each row execute function public.set_updated_at();

create policy "dados_escolares_select_staff" on public.dados_escolares
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

create policy "dados_escolares_write_staff" on public.dados_escolares
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
-- Auditoria — cobre oferta, turma e matrícula interna (regra 7). Mudança de
-- situação já é coberta pelo trigger existente de estudantes, já que
-- `situacao` continua vivendo lá, não aqui.
-- ---------------------------------------------------------------------------
create table public.dados_escolares_auditoria (
  id uuid primary key default gen_random_uuid(),
  dados_escolares_id uuid not null references public.dados_escolares(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  alterado_por uuid references public.usuarios(id),
  alterado_em timestamptz not null default now()
);

create policy "dados_escolares_auditoria_select_staff" on public.dados_escolares_auditoria
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

create or replace function public.audit_dados_escolares_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.oferta_atual_id is distinct from old.oferta_atual_id then
    insert into public.dados_escolares_auditoria (dados_escolares_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'oferta_atual_id', old.oferta_atual_id::text, new.oferta_atual_id::text, auth.uid());
  end if;

  if new.turma_id is distinct from old.turma_id then
    insert into public.dados_escolares_auditoria (dados_escolares_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'turma_id', old.turma_id::text, new.turma_id::text, auth.uid());
  end if;

  if new.matricula_interna is distinct from old.matricula_interna then
    insert into public.dados_escolares_auditoria (dados_escolares_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'matricula_interna', old.matricula_interna, new.matricula_interna, auth.uid());
  end if;

  return new;
end;
$$;

create trigger trg_dados_escolares_audit
  after update on public.dados_escolares
  for each row execute function public.audit_dados_escolares_changes();
