-- Corrige um bug da migration 20260923090000_auditoria_ampliada.sql: os 3
-- triggers `AFTER DELETE` (documentos_estudante, avaliacao_contribuicoes,
-- condicoes_estudante) tentavam inserir uma linha de auditoria referenciando
-- `old.id` — mas a FK dessas colunas é `not null references ... on delete
-- cascade`, e a linha referenciada já não existe mais no momento em que o
-- trigger roda (é a própria linha sendo apagada). Isso derrubava a FK e
-- fazia a exclusão inteira falhar — `removerCondicao`/`removerContribuicao`/
-- a remoção de documento "outro" ficavam quebradas desde aquela migration.
--
-- Correção: as colunas viram nullable, e os triggers de delete passam a
-- gravar null nelas — o registro de "isso foi removido" continua completo
-- (estudante_id/avaliacao_id + o rótulo em valor_anterior já identificam o
-- que foi removido), só não referencia mais uma linha que deixou de existir.
alter table public.documentos_estudante_auditoria
  alter column documento_id drop not null;

alter table public.avaliacao_contribuicoes_auditoria
  alter column contribuicao_id drop not null;

alter table public.condicoes_estudante_auditoria
  alter column condicao_id drop not null;

create or replace function public.audit_documentos_estudante_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.documentos_estudante_auditoria (documento_id, estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
  values (null, old.estudante_id, old.escola_id, 'documento_removido', coalesce(old.nome_documento, old.tipo), null, auth.uid());
  return old;
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
  values (null, old.avaliacao_id, old.escola_id, 'contribuicao_removida', old.area_contribuicao, null, auth.uid());
  return old;
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
  values (null, old.estudante_id, old.escola_id, 'condicao_removida', old.tipo_condicao, null, auth.uid());
  return old;
end;
$$;
