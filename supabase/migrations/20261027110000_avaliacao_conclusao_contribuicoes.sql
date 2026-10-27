-- Decisões do P.O (2026-10-27) que estavam pendentes na Avaliação de
-- Ingresso:
-- 1. Concluir: só Pedagogo(a) e Administrador. Direção só retifica e
--    cancela (pode_fechar_avaliacao() continua valendo pra essas duas).
-- 2. Contribuições dos profissionais complementares travam junto com a
--    versão: Concluída, Retificada ou Cancelada não aceitam incluir, editar
--    nem remover contribuição.

create or replace function public.pode_concluir_avaliacao()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select coalesce(
    public.get_user_role() = any (
      array['administrador', 'coordenacao_pedagogica']::public.user_role[]
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
    if not public.pode_concluir_avaliacao() then
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

create or replace function public.avaliacao_contribuicoes_travadas()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  select status_avaliacao into v_status
    from public.avaliacoes_ingresso
    where id = case when tg_op = 'DELETE' then old.avaliacao_id else new.avaliacao_id end;

  -- Sem avaliação (remoção em cascata do estudante/avaliação): deixa passar.
  if v_status is not null and v_status not in ('rascunho', 'em_andamento') then
    raise exception 'A Avaliação de Ingresso está %: as contribuições não podem mais ser alteradas.', v_status
      using errcode = 'check_violation';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger trg_avaliacao_contribuicoes_travadas
  before insert or update or delete on public.avaliacao_contribuicoes
  for each row execute function public.avaliacao_contribuicoes_travadas();
