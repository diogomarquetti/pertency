-- Ofertas com código SERE no cadastro da turma (tabela do P.O de
-- 2026-10-29). A turma passa a guardar a oferta SERE escolhida
-- (`oferta_sere`); `oferta_id` continua sendo o grupo (ei/ef/eja/...), que
-- o resto do sistema usa. As regras de cada oferta (organizações permitidas,
-- forma de funcionamento) ficam em lib/ofertas-config.ts. Nada é apagado.

-- Grupos novos: 6036 e 5110, ainda sem estrutura curricular definida.
insert into public.ofertas (slug, nome) values
  ('aee_infantil', 'Apoio Educacional Infantil Especializado'),
  ('curriculo_funcional', 'Programa Pedagógico do Currículo Funcional')
on conflict (slug) do nothing;

-- Organização única de mesmo nome, uma por escola.
insert into public.etapas_ciclos (escola_id, oferta_id, nome, ordem, codigo)
select esc.id, o.id, o.nome, 1, o.slug
from public.escolas esc
join public.ofertas o on o.slug in ('aee_infantil', 'curriculo_funcional')
on conflict do nothing;

alter table public.turmas
  add column oferta_sere text check (oferta_sere in ('6005', '6046', '6036', '6053', '6039', '6054', '5110'));

-- Turmas existentes: onde o grupo/organização só tem uma oferta SERE, ela é
-- preenchida. Educação Infantil (6005 ou 6046) fica vazia e é escolhida na
-- próxima edição da turma.
update public.turmas t
set oferta_sere = case
  when o.slug = 'ef' then '6053'
  when e.codigo = 'eja_fase_1' then '6039'
  when e.codigo = 'eja_fase_1_especial' then '6054'
end
from public.ofertas o, public.etapas_ciclos e
where o.id = t.oferta_id and e.id = t.etapa_ciclo_id;

-- 6036 e 5110 ainda não têm matriz curricular. O app continua exigindo a
-- matriz nas demais ofertas.
alter table public.turmas alter column matriz_curricular_id drop not null;

-- Histórico de alterações passa a registrar a oferta SERE.
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

  if new.oferta_sere is distinct from old.oferta_sere then
    insert into public.turmas_auditoria (turma_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'oferta_sere', old.oferta_sere, new.oferta_sere, auth.uid());
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
