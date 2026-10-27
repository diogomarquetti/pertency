-- Forma de funcionamento e cronograma de atendimento da turma (retorno do
-- P.O, seção 4). A regra por organização (diária / cronograma / livre) fica
-- em lib/ofertas-config.ts; aqui só o dado.

alter table public.turmas
  add column forma_funcionamento text check (forma_funcionamento in ('diaria', 'cronograma'));

-- Turmas existentes: EJA Fase I – Educação Especial (6054) funciona por
-- cronograma; todas as demais, inclusive as de organização descontinuada,
-- são diárias. O cronograma em si é preenchido na próxima edição.
update public.turmas t
set forma_funcionamento = case when e.codigo = 'eja_fase_1_especial' then 'cronograma' else 'diaria' end
from public.etapas_ciclos e
where e.id = t.etapa_ciclo_id;

update public.turmas set forma_funcionamento = 'diaria' where forma_funcionamento is null;

-- Default só pra não quebrar quem insere sem informar (versão anterior do
-- app ainda em produção até o deploy); o app sempre grava o valor.
alter table public.turmas
  alter column forma_funcionamento set default 'diaria',
  alter column forma_funcionamento set not null;

-- 1 para 1 com a turma. A frequência semanal é calculada (nº de dias), não
-- gravada. Não valida se o horário cabe no turno (PROVISÓRIO).
create table public.turma_cronograma (
  turma_id uuid primary key references public.turmas(id) on delete cascade,
  dias_semana smallint[] not null check (cardinality(dias_semana) > 0 and dias_semana <@ array[1, 2, 3, 4, 5]::smallint[]),
  hora_inicio time not null,
  hora_fim time not null,
  check (hora_fim > hora_inicio)
);

create policy "turma_cronograma_select" on public.turma_cronograma
  for select using (
    exists (
      select 1 from public.turmas t
      where t.id = turma_cronograma.turma_id and t.escola_id = public.get_escola_id()
    )
  );

create policy "turma_cronograma_write_admin" on public.turma_cronograma
  using (
    exists (
      select 1 from public.turmas t
      where t.id = turma_cronograma.turma_id and t.escola_id = public.get_escola_id()
    )
    and public.get_user_role() = 'administrador'::public.user_role
  )
  with check (
    exists (
      select 1 from public.turmas t
      where t.id = turma_cronograma.turma_id and t.escola_id = public.get_escola_id()
    )
    and public.get_user_role() = 'administrador'::public.user_role
  );

-- Histórico de alterações: além de status/nome/capacidade/oferta, passa a
-- registrar organização, ciclo, matriz e forma de funcionamento.
create or replace function public.audit_turmas_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.turmas_auditoria (turma_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'status', old.status, new.status, auth.uid());
  end if;

  if new.nome is distinct from old.nome then
    insert into public.turmas_auditoria (turma_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'nome', old.nome, new.nome, auth.uid());
  end if;

  if new.capacidade is distinct from old.capacidade then
    insert into public.turmas_auditoria (turma_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'capacidade', old.capacidade::text, new.capacidade::text, auth.uid());
  end if;

  if new.oferta_id is distinct from old.oferta_id then
    insert into public.turmas_auditoria (turma_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'oferta_id', old.oferta_id::text, new.oferta_id::text, auth.uid());
  end if;

  if new.etapa_ciclo_id is distinct from old.etapa_ciclo_id then
    insert into public.turmas_auditoria (turma_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'etapa_ciclo_id', old.etapa_ciclo_id::text, new.etapa_ciclo_id::text, auth.uid());
  end if;

  if new.ciclo is distinct from old.ciclo then
    insert into public.turmas_auditoria (turma_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'ciclo', old.ciclo::text, new.ciclo::text, auth.uid());
  end if;

  if new.matriz_curricular_id is distinct from old.matriz_curricular_id then
    insert into public.turmas_auditoria (turma_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'matriz_curricular_id', old.matriz_curricular_id::text, new.matriz_curricular_id::text, auth.uid());
  end if;

  if new.forma_funcionamento is distinct from old.forma_funcionamento then
    insert into public.turmas_auditoria (turma_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'forma_funcionamento', old.forma_funcionamento, new.forma_funcionamento, auth.uid());
  end if;

  return new;
end;
$$;
