-- Avaliação de Ingresso: nível de apoio e justificativa por área (ajuste do P.O, 2026-11-16).
-- Substitui o par nivel_apoio (único) + areas_apoio (lista) por uma lista de
-- { area, nivel, justificativa }. As colunas antigas ficam no banco, sem uso
-- pela aplicação (histórico das versões já fechadas).

alter table public.avaliacoes_ingresso
  add column if not exists apoios_por_area jsonb;

-- Backfill: cada área já marcada herda o nível único antigo, sem justificativa.
-- Versões concluídas são imutáveis (trigger) e a cópia não é ato do usuário:
-- desliga os triggers de usuário só durante o backfill.
alter table public.avaliacoes_ingresso disable trigger user;

update public.avaliacoes_ingresso a
set apoios_por_area = (
  select coalesce(jsonb_agg(jsonb_build_object(
    'area', area, 'nivel', coalesce(a.nivel_apoio, ''), 'justificativa', ''
  )), '[]'::jsonb)
  from unnest(a.areas_apoio) as area
)
where a.areas_apoio is not null and a.apoios_por_area is null;

alter table public.avaliacoes_ingresso enable trigger user;

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

  if new.apoios_por_area is distinct from old.apoios_por_area then
    insert into public.avaliacoes_ingresso_auditoria (avaliacao_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'apoios_por_area', old.apoios_por_area::text, new.apoios_por_area::text, auth.uid());
  end if;

  return new;
end;
$$;
