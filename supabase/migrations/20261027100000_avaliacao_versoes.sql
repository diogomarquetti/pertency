-- Avaliação de Ingresso imutável depois de concluída (retorno do P.O,
-- seção 6). Cada versão é uma linha própria de avaliacoes_ingresso,
-- encadeada pela anterior em `avaliacao_origem_id`:
--   v1 Concluída → "Retificar" cria v2 (Em andamento, cópia da v1) → ao
--   concluir a v2, a v1 passa a Retificada.
-- Nenhum dado é apagado; "Não iniciada" vira Rascunho e "Reaberta" vira
-- Em andamento (o fluxo de reabrir deixa de existir).

-- ---------------------------------------------------------------------------
-- Status
-- ---------------------------------------------------------------------------
alter table public.avaliacoes_ingresso drop constraint if exists avaliacoes_ingresso_status_avaliacao_check;

update public.avaliacoes_ingresso set status_avaliacao = 'rascunho' where status_avaliacao = 'nao_iniciada';
update public.avaliacoes_ingresso set status_avaliacao = 'em_andamento' where status_avaliacao = 'reaberta';

alter table public.avaliacoes_ingresso
  alter column status_avaliacao set default 'rascunho',
  add constraint avaliacoes_ingresso_status_avaliacao_check check (
    status_avaliacao in ('rascunho', 'em_andamento', 'concluida', 'retificada', 'cancelada')
  );

-- ---------------------------------------------------------------------------
-- Versões
-- ---------------------------------------------------------------------------
alter table public.avaliacoes_ingresso
  add column versao integer not null default 1,
  add column avaliacao_origem_id uuid references public.avaliacoes_ingresso(id),
  add column justificativa_retificacao text,
  add column retificacao_solicitada_em timestamptz,
  add column retificacao_solicitada_por uuid references public.usuarios(id),
  add column concluida_em timestamptz,
  add column concluida_por uuid references public.usuarios(id),
  add column justificativa_cancelamento text,
  add column cancelada_em timestamptz,
  add column cancelada_por uuid references public.usuarios(id);

-- Concluídas existentes: a melhor data disponível é o último salvamento.
update public.avaliacoes_ingresso set concluida_em = updated_at where status_avaliacao = 'concluida';

-- Deixa de ser 1:1 com o estudante. Continua valendo: no máximo uma versão
-- em edição e uma vigente (Concluída) por vez; canceladas não contam.
alter table public.avaliacoes_ingresso drop constraint if exists avaliacoes_ingresso_estudante_id_key;

create unique index avaliacoes_ingresso_estudante_versao_unica
  on public.avaliacoes_ingresso (estudante_id, versao)
  where status_avaliacao <> 'cancelada';

create unique index avaliacoes_ingresso_uma_em_edicao
  on public.avaliacoes_ingresso (estudante_id)
  where status_avaliacao in ('rascunho', 'em_andamento');

create unique index avaliacoes_ingresso_uma_vigente
  on public.avaliacoes_ingresso (estudante_id)
  where status_avaliacao = 'concluida';

-- ---------------------------------------------------------------------------
-- Imutabilidade
-- ---------------------------------------------------------------------------
-- PROVISÓRIO: validar com P.O — perfis que concluem, retificam e cancelam.
create or replace function public.pode_fechar_avaliacao()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select coalesce(
    public.get_user_role() = any (
      array['administrador', 'coordenacao_pedagogica', 'direcao']::public.user_role[]
    ),
    false
  );
$$;

create or replace function public.avaliacoes_ingresso_imutavel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.status_avaliacao in ('concluida', 'retificada', 'cancelada') then
    -- Única mudança aceita numa linha fechada: Concluída → Retificada, sem
    -- mexer em mais nada, feita pela conclusão da versão seguinte (abaixo).
    if not (
      old.status_avaliacao = 'concluida'
      and new.status_avaliacao = 'retificada'
      and current_setting('app.retificando_avaliacao', true) = old.id::text
      and (to_jsonb(new) - 'status_avaliacao' - 'updated_at') = (to_jsonb(old) - 'status_avaliacao' - 'updated_at')
    ) then
      raise exception 'Avaliação de Ingresso % está fechada e não pode ser alterada. Use "Retificar avaliação".', old.status_avaliacao
        using errcode = 'check_violation';
    end if;
    return new;
  end if;

  if new.status_avaliacao = 'retificada' then
    raise exception 'O status Retificada é definido pelo sistema.' using errcode = 'check_violation';
  end if;

  -- Cancelamento só pela função cancelar_avaliacao_ingresso (que preenche
  -- justificativa, data e usuário).
  if new.status_avaliacao = 'cancelada' then
    if not public.pode_fechar_avaliacao() then
      raise exception 'Seu perfil não pode cancelar a Avaliação de Ingresso.' using errcode = 'insufficient_privilege';
    end if;
    if new.justificativa_cancelamento is null or new.cancelada_em is null then
      raise exception 'Cancelamento exige justificativa.' using errcode = 'check_violation';
    end if;
  end if;

  if new.status_avaliacao = 'concluida' and (tg_op = 'INSERT' or old.status_avaliacao <> 'concluida') then
    if not public.pode_fechar_avaliacao() then
      raise exception 'Seu perfil não pode concluir a Avaliação de Ingresso.' using errcode = 'insufficient_privilege';
    end if;
    new.concluida_em := now();
    new.concluida_por := auth.uid();

    -- Concluir uma retificação: a versão anterior deixa de ser a vigente.
    if new.avaliacao_origem_id is not null then
      perform set_config('app.retificando_avaliacao', new.avaliacao_origem_id::text, true);
      update public.avaliacoes_ingresso
        set status_avaliacao = 'retificada'
        where id = new.avaliacao_origem_id and status_avaliacao = 'concluida';
      perform set_config('app.retificando_avaliacao', '', true);
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_avaliacoes_ingresso_imutavel
  before insert or update on public.avaliacoes_ingresso
  for each row execute function public.avaliacoes_ingresso_imutavel();

-- ---------------------------------------------------------------------------
-- Retificar: cria a versão N+1 como cópia da vigente, em edição.
-- PROVISÓRIO: validar com P.O — fluxo de retificação.
-- ---------------------------------------------------------------------------
create or replace function public.retificar_avaliacao_ingresso(p_avaliacao_id uuid, p_justificativa text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_origem public.avaliacoes_ingresso;
  v_nova_id uuid := gen_random_uuid();
begin
  if not public.pode_fechar_avaliacao() then
    raise exception 'Seu perfil não pode retificar a Avaliação de Ingresso.' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(trim(p_justificativa), '') = '' then
    raise exception 'Informe a justificativa da retificação.' using errcode = 'check_violation';
  end if;

  select * into v_origem from public.avaliacoes_ingresso
    where id = p_avaliacao_id and escola_id = public.get_escola_id();
  if not found or v_origem.status_avaliacao <> 'concluida' then
    raise exception 'Só a versão vigente (Concluída) pode ser retificada.' using errcode = 'check_violation';
  end if;

  insert into public.avaliacoes_ingresso
  select (jsonb_populate_record(
    null::public.avaliacoes_ingresso,
    to_jsonb(v_origem) || jsonb_build_object(
      'id', v_nova_id,
      'versao', v_origem.versao + 1,
      'avaliacao_origem_id', v_origem.id,
      'status_avaliacao', 'em_andamento',
      'justificativa_retificacao', trim(p_justificativa),
      'retificacao_solicitada_em', now(),
      'retificacao_solicitada_por', auth.uid(),
      'concluida_em', null,
      'concluida_por', null,
      'justificativa_cancelamento', null,
      'cancelada_em', null,
      'cancelada_por', null,
      'created_by', auth.uid(),
      'created_at', now(),
      'updated_at', now()
    )
  )).*;

  insert into public.avaliacoes_ingresso_auditoria (avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
  values (v_nova_id, v_origem.escola_id, 'retificacao', 'Versão ' || v_origem.versao, 'Versão ' || (v_origem.versao + 1) || ': ' || trim(p_justificativa), auth.uid());

  return v_nova_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Cancelar: só Rascunho ou Em andamento, com justificativa.
-- PROVISÓRIO: validar com P.O — regra de cancelamento.
-- ---------------------------------------------------------------------------
create or replace function public.cancelar_avaliacao_ingresso(p_avaliacao_id uuid, p_justificativa text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avaliacao public.avaliacoes_ingresso;
begin
  if not public.pode_fechar_avaliacao() then
    raise exception 'Seu perfil não pode cancelar a Avaliação de Ingresso.' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(trim(p_justificativa), '') = '' then
    raise exception 'Informe a justificativa do cancelamento.' using errcode = 'check_violation';
  end if;

  select * into v_avaliacao from public.avaliacoes_ingresso
    where id = p_avaliacao_id and escola_id = public.get_escola_id();
  if not found or v_avaliacao.status_avaliacao not in ('rascunho', 'em_andamento') then
    raise exception 'Só avaliação em Rascunho ou Em andamento pode ser cancelada.' using errcode = 'check_violation';
  end if;

  update public.avaliacoes_ingresso
    set status_avaliacao = 'cancelada',
        justificativa_cancelamento = trim(p_justificativa),
        cancelada_em = now(),
        cancelada_por = auth.uid()
    where id = p_avaliacao_id;

  insert into public.avaliacoes_ingresso_auditoria (avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
  values (p_avaliacao_id, v_avaliacao.escola_id, 'justificativa_cancelamento', null, trim(p_justificativa), auth.uid());
end;
$$;

revoke execute on function public.retificar_avaliacao_ingresso(uuid, text) from public, anon;
revoke execute on function public.cancelar_avaliacao_ingresso(uuid, text) from public, anon;
grant execute on function public.retificar_avaliacao_ingresso(uuid, text) to authenticated;
grant execute on function public.cancelar_avaliacao_ingresso(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Relatórios em PDF: ficam ligados à versão (cada versão é uma linha de
-- avaliacoes_ingresso, então avaliacao_id já identifica a versão). Só se
-- gera a partir de versão Concluída e não se duplica tipo na mesma versão
-- (checado na aplicação — já existem duplicatas antigas que não são
-- apagadas, então não dá pra pôr índice único aqui).
-- ---------------------------------------------------------------------------
