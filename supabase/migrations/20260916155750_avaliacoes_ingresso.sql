-- Cadastro de Estudante — Fase 2 (Aba 2: Avaliação de Ingresso).
-- docs/requisitos/cadastro-estudante.md, seção 2. Reaproveita o catálogo de
-- Ofertas/Organização já criado pro Cadastro de Turma (public.ofertas,
-- public.etapas_ciclos) pra "Oferta pretendida"/"Organização pretendida".

create table public.avaliacoes_ingresso (
  id uuid primary key default gen_random_uuid(),
  estudante_id uuid not null unique references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),

  -- Identificação da avaliação
  equipe_responsavel_ids uuid[],
  oferta_pretendida_id uuid references public.ofertas(id),
  organizacao_pretendida_id uuid references public.etapas_ciclos(id),
  data_inicio date,
  data_termino date,
  status_avaliacao text not null default 'nao_iniciada' check (
    status_avaliacao in ('nao_iniciada', 'em_andamento', 'concluida', 'reaberta')
  ),

  -- Histórico e contexto
  historico_escolar text,
  informacoes_familia text,
  contexto_sociocultural text,

  -- Análise pedagógica
  habilidades_conceituais text,
  habilidades_sociais text,
  habilidades_praticas text,
  dimensao_participacao text,
  dimensao_contexto text,

  -- Necessidades e parecer
  necessidades_especificas text,
  nivel_apoio text check (nivel_apoio in ('intermitente', 'limitado', 'extensivo', 'pervasivo')),
  parecer_equipe text,
  recomendacao_elegibilidade text check (recomendacao_elegibilidade in ('elegivel', 'nao_elegivel')),
  orientacoes_pai text,
  assinaturas text,

  created_by uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_avaliacoes_ingresso_updated_at
  before update on public.avaliacoes_ingresso
  for each row execute function public.set_updated_at();

create policy "avaliacoes_ingresso_select_same_escola" on public.avaliacoes_ingresso
  for select using (escola_id = public.get_escola_id());

create policy "avaliacoes_ingresso_write_staff" on public.avaliacoes_ingresso
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
-- Auditoria — cobre os dois campos que a história marca como precisando de
-- histórico (regra 8): status e recomendação de elegibilidade.
-- ---------------------------------------------------------------------------
create table public.avaliacoes_ingresso_auditoria (
  id uuid primary key default gen_random_uuid(),
  avaliacao_id uuid not null references public.avaliacoes_ingresso(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  alterado_por uuid references public.usuarios(id),
  alterado_em timestamptz not null default now()
);

create policy "avaliacoes_ingresso_auditoria_select_staff" on public.avaliacoes_ingresso_auditoria
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

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

  return new;
end;
$$;

create trigger trg_avaliacoes_ingresso_audit
  after update on public.avaliacoes_ingresso
  for each row execute function public.audit_avaliacoes_ingresso_changes();
