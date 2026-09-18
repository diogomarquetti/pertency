-- Cadastro de Estudante — Onda 4 (fatia 1): Auditoria ampliada.
-- docs/requisitos/cadastro-estudante.md §18.2 / CA32: situação, elegibilidade,
-- oferta e organização, turno e turma, número de matrícula, documentos e
-- anexos, parecer/análise integrada, contribuições profissionais, condições
-- e alertas funcionais precisam registrar usuário + data/hora + valor
-- anterior/novo. Mesmo padrão já usado em usuarios_auditoria/
-- estudantes_auditoria: tabela genérica campo_alterado/valor_anterior/
-- valor_novo, populada por trigger security definer, nunca escrita pela
-- aplicação.

-- ---------------------------------------------------------------------------
-- Fecha lacunas nos 2 triggers já existentes (create or replace, sem alterar
-- schema) — cobrem só os campos originais de cada onda, e a Reestruturação
-- da Avaliação / o vínculo anual ganharam campos novos desde então.
-- ---------------------------------------------------------------------------
create or replace function public.audit_avaliacoes_ingresso_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status_avaliacao is distinct from old.status_avaliacao then
    insert into public.avaliacoes_ingresso_auditoria (avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'status_avaliacao', old.status_avaliacao, new.status_avaliacao, auth.uid());
  end if;

  if new.recomendacao_elegibilidade is distinct from old.recomendacao_elegibilidade then
    insert into public.avaliacoes_ingresso_auditoria (avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'recomendacao_elegibilidade', old.recomendacao_elegibilidade, new.recomendacao_elegibilidade, auth.uid());
  end if;

  if new.parecer_equipe is distinct from old.parecer_equipe then
    insert into public.avaliacoes_ingresso_auditoria (avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'parecer_equipe', old.parecer_equipe, new.parecer_equipe, auth.uid());
  end if;

  if new.justificativa_elegibilidade is distinct from old.justificativa_elegibilidade then
    insert into public.avaliacoes_ingresso_auditoria (avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'justificativa_elegibilidade', old.justificativa_elegibilidade, new.justificativa_elegibilidade, auth.uid());
  end if;

  if new.encaminhamento_recomendado is distinct from old.encaminhamento_recomendado then
    insert into public.avaliacoes_ingresso_auditoria (avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'encaminhamento_recomendado', old.encaminhamento_recomendado, new.encaminhamento_recomendado, auth.uid());
  end if;

  if new.areas_apoio is distinct from old.areas_apoio then
    insert into public.avaliacoes_ingresso_auditoria (avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'areas_apoio', old.areas_apoio::text, new.areas_apoio::text, auth.uid());
  end if;

  return new;
end;
$$;

create or replace function public.audit_vinculos_escolares_anuais_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.oferta_atual_id is distinct from old.oferta_atual_id then
    insert into public.vinculos_escolares_anuais_auditoria (vinculo_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'oferta_atual_id', old.oferta_atual_id::text, new.oferta_atual_id::text, auth.uid());
  end if;

  if new.organizacao_atual_id is distinct from old.organizacao_atual_id then
    insert into public.vinculos_escolares_anuais_auditoria (vinculo_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'organizacao_atual_id', old.organizacao_atual_id::text, new.organizacao_atual_id::text, auth.uid());
  end if;

  if new.turno_id is distinct from old.turno_id then
    insert into public.vinculos_escolares_anuais_auditoria (vinculo_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'turno_id', old.turno_id::text, new.turno_id::text, auth.uid());
  end if;

  if new.turma_id is distinct from old.turma_id then
    insert into public.vinculos_escolares_anuais_auditoria (vinculo_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'turma_id', old.turma_id::text, new.turma_id::text, auth.uid());
  end if;

  if new.matricula_interna is distinct from old.matricula_interna then
    insert into public.vinculos_escolares_anuais_auditoria (vinculo_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'matricula_interna', old.matricula_interna, new.matricula_interna, auth.uid());
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- documentos_estudante — "documentos e anexos". status muda de mão em mão
-- (pendente → entregue → …), e "outro" documento pode ser removido.
-- ---------------------------------------------------------------------------
create table public.documentos_estudante_auditoria (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid not null references public.documentos_estudante(id) on delete cascade,
  estudante_id uuid not null references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  alterado_por uuid references public.usuarios(id),
  alterado_em timestamptz not null default now()
);

create policy "documentos_estudante_auditoria_select_staff" on public.documentos_estudante_auditoria
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

create or replace function public.audit_documentos_estudante_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.documentos_estudante_auditoria (documento_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.estudante_id, new.escola_id, 'documento_status', old.status, new.status, auth.uid());
  end if;

  return new;
end;
$$;

create or replace function public.audit_documentos_estudante_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.documentos_estudante_auditoria (documento_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
  values (old.id, old.estudante_id, old.escola_id, 'documento_removido', coalesce(old.nome_documento, old.tipo), null, auth.uid());
  return old;
end;
$$;

create trigger trg_documentos_estudante_audit
  after update on public.documentos_estudante
  for each row execute function public.audit_documentos_estudante_changes();

create trigger trg_documentos_estudante_audit_delete
  after delete on public.documentos_estudante
  for each row execute function public.audit_documentos_estudante_delete();

-- ---------------------------------------------------------------------------
-- avaliacao_contribuicoes — "contribuições profissionais". Sem estudante_id
-- próprio (só avaliacao_id) — mesma situação de avaliacoes_ingresso_auditoria,
-- não denormaliza; a leitura filtra via join.
-- ---------------------------------------------------------------------------
create table public.avaliacao_contribuicoes_auditoria (
  id uuid primary key default gen_random_uuid(),
  contribuicao_id uuid not null references public.avaliacao_contribuicoes(id) on delete cascade,
  avaliacao_id uuid not null references public.avaliacoes_ingresso(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  alterado_por uuid references public.usuarios(id),
  alterado_em timestamptz not null default now()
);

create policy "avaliacao_contribuicoes_auditoria_select_staff" on public.avaliacao_contribuicoes_auditoria
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

create or replace function public.audit_avaliacao_contribuicoes_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.observacoes is distinct from old.observacoes then
    insert into public.avaliacao_contribuicoes_auditoria (contribuicao_id, avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.avaliacao_id, new.escola_id, 'contribuicao_observacoes', old.observacoes, new.observacoes, auth.uid());
  end if;

  if new.implicacoes_participacao is distinct from old.implicacoes_participacao then
    insert into public.avaliacao_contribuicoes_auditoria (contribuicao_id, avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.avaliacao_id, new.escola_id, 'contribuicao_implicacoes', old.implicacoes_participacao, new.implicacoes_participacao, auth.uid());
  end if;

  if new.recomendacoes_escolares is distinct from old.recomendacoes_escolares then
    insert into public.avaliacao_contribuicoes_auditoria (contribuicao_id, avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.avaliacao_id, new.escola_id, 'contribuicao_recomendacoes', old.recomendacoes_escolares, new.recomendacoes_escolares, auth.uid());
  end if;

  return new;
end;
$$;

create or replace function public.audit_avaliacao_contribuicoes_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.avaliacao_contribuicoes_auditoria (contribuicao_id, avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
  values (old.id, old.avaliacao_id, old.escola_id, 'contribuicao_removida', old.area_contribuicao, null, auth.uid());
  return old;
end;
$$;

create trigger trg_avaliacao_contribuicoes_audit
  after update on public.avaliacao_contribuicoes
  for each row execute function public.audit_avaliacao_contribuicoes_changes();

create trigger trg_avaliacao_contribuicoes_audit_delete
  after delete on public.avaliacao_contribuicoes
  for each row execute function public.audit_avaliacao_contribuicoes_delete();

-- ---------------------------------------------------------------------------
-- condicoes_estudante — "condições e alertas funcionais".
-- ---------------------------------------------------------------------------
create table public.condicoes_estudante_auditoria (
  id uuid primary key default gen_random_uuid(),
  condicao_id uuid not null references public.condicoes_estudante(id) on delete cascade,
  estudante_id uuid not null references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  alterado_por uuid references public.usuarios(id),
  alterado_em timestamptz not null default now()
);

-- Mesmo conjunto restrito de condicoes_estudante_write_restrito — não o
-- staff mais amplo usado nas outras tabelas de auditoria desta migration.
create policy "condicoes_estudante_auditoria_select_restrito" on public.condicoes_estudante_auditoria
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (array['administrador', 'coordenacao_pedagogica']::public.user_role[])
  );

create or replace function public.audit_condicoes_estudante_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.tipo_condicao is distinct from old.tipo_condicao then
    insert into public.condicoes_estudante_auditoria (condicao_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.estudante_id, new.escola_id, 'condicao_tipo', old.tipo_condicao, new.tipo_condicao, auth.uid());
  end if;

  if new.cid is distinct from old.cid then
    insert into public.condicoes_estudante_auditoria (condicao_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.estudante_id, new.escola_id, 'condicao_cid', old.cid, new.cid, auth.uid());
  end if;

  if new.observacoes is distinct from old.observacoes then
    insert into public.condicoes_estudante_auditoria (condicao_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.estudante_id, new.escola_id, 'condicao_observacoes', old.observacoes, new.observacoes, auth.uid());
  end if;

  return new;
end;
$$;

create or replace function public.audit_condicoes_estudante_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.condicoes_estudante_auditoria (condicao_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
  values (old.id, old.estudante_id, old.escola_id, 'condicao_removida', old.tipo_condicao, null, auth.uid());
  return old;
end;
$$;

create trigger trg_condicoes_estudante_audit
  after update on public.condicoes_estudante
  for each row execute function public.audit_condicoes_estudante_changes();

create trigger trg_condicoes_estudante_audit_delete
  after delete on public.condicoes_estudante
  for each row execute function public.audit_condicoes_estudante_delete();

-- ---------------------------------------------------------------------------
-- perfil_funcional_estudante — mesmo domínio de condicoes_estudante ("condições
-- e alertas funcionais"). Só os campos de segurança/saúde/alerta — não o
-- perfil inteiro (recursos de comunicação, apoios de rotina etc. ficam de
-- fora por enquanto). Sem trigger de delete: registro 1:1, sem ação de
-- remover.
-- ---------------------------------------------------------------------------
create table public.perfil_funcional_estudante_auditoria (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfil_funcional_estudante(id) on delete cascade,
  estudante_id uuid not null references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  alterado_por uuid references public.usuarios(id),
  alterado_em timestamptz not null default now()
);

create policy "perfil_funcional_estudante_auditoria_select_restrito" on public.perfil_funcional_estudante_auditoria
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (array['administrador', 'coordenacao_pedagogica']::public.user_role[])
  );

create or replace function public.audit_perfil_funcional_estudante_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.necessita_medicacao is distinct from old.necessita_medicacao then
    insert into public.perfil_funcional_estudante_auditoria (perfil_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.estudante_id, new.escola_id, 'necessita_medicacao', old.necessita_medicacao::text, new.necessita_medicacao::text, auth.uid());
  end if;

  if new.medicacao_detalhes is distinct from old.medicacao_detalhes then
    insert into public.perfil_funcional_estudante_auditoria (perfil_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.estudante_id, new.escola_id, 'medicacao_detalhes', old.medicacao_detalhes, new.medicacao_detalhes, auth.uid());
  end if;

  if new.alergias_restricoes is distinct from old.alergias_restricoes then
    insert into public.perfil_funcional_estudante_auditoria (perfil_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.estudante_id, new.escola_id, 'alergias_restricoes', old.alergias_restricoes, new.alergias_restricoes, auth.uid());
  end if;

  if new.situacoes_atencao is distinct from old.situacoes_atencao then
    insert into public.perfil_funcional_estudante_auditoria (perfil_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.estudante_id, new.escola_id, 'situacoes_atencao', old.situacoes_atencao, new.situacoes_atencao, auth.uid());
  end if;

  if new.o_que_ajuda is distinct from old.o_que_ajuda then
    insert into public.perfil_funcional_estudante_auditoria (perfil_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.estudante_id, new.escola_id, 'o_que_ajuda', old.o_que_ajuda, new.o_que_ajuda, auth.uid());
  end if;

  if new.seguranca_cuidados is distinct from old.seguranca_cuidados then
    insert into public.perfil_funcional_estudante_auditoria (perfil_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.estudante_id, new.escola_id, 'seguranca_cuidados', old.seguranca_cuidados, new.seguranca_cuidados, auth.uid());
  end if;

  return new;
end;
$$;

create trigger trg_perfil_funcional_estudante_audit
  after update on public.perfil_funcional_estudante
  for each row execute function public.audit_perfil_funcional_estudante_changes();
