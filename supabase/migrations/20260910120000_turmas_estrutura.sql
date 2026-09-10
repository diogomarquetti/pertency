-- Cadastro de Turmas — Fase 1 (Blocos 1, 2, 3 e 6 de
-- "Cadastro Turma - Historia Usuario.md"): identificação, oferta/organização,
-- estrutura curricular dinâmica por oferta, observações/status.
--
-- Ano Letivo, Ofertas/Etapas e Matriz Curricular são tratados na história como
-- módulos de configuração próprios (ainda sem tela de admin) — por decisão do
-- usuário, entram aqui via seed fixo; a evolução pra CRUDs completos fica
-- para depois.

-- ---------------------------------------------------------------------------
-- Ofertas (Educação Infantil / Ensino Fundamental / EJA Fase I) — global.
-- ---------------------------------------------------------------------------
create table public.ofertas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null
);

insert into public.ofertas (slug, nome) values
  ('ei', 'Educação Infantil'),
  ('ef', 'Ensino Fundamental'),
  ('eja', 'EJA Fase I');

create policy "ofertas_select_all" on public.ofertas
  for select using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Matriz curricular vinculada à turma — global, uma ou mais por oferta.
-- ---------------------------------------------------------------------------
create table public.matrizes_curriculares (
  id uuid primary key default gen_random_uuid(),
  oferta_id uuid not null references public.ofertas(id),
  nome text not null
);

insert into public.matrizes_curriculares (oferta_id, nome)
select o.id, m.nome
from public.ofertas o
join (values
  ('ei', 'Matriz EI — Estimulação Essencial'),
  ('ei', 'Matriz EI — Pré-Escolar'),
  ('ef', 'Matriz EF — 1º Ciclo'),
  ('ef', 'Matriz EF — 2º Ciclo'),
  ('eja', 'Matriz EJA — Fase I')
) as m(slug, nome) on m.slug = o.slug;

create policy "matrizes_curriculares_select_all" on public.matrizes_curriculares
  for select using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Ano letivo — escola-scoped ("Ano letivo inativo ou encerrado não deve
-- permitir nova turma ativa").
-- ---------------------------------------------------------------------------
create table public.anos_letivos (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas(id),
  ano integer not null,
  status text not null default 'ativo' check (status in ('ativo', 'planejado', 'encerrado')),
  unique (escola_id, ano)
);

insert into public.anos_letivos (escola_id, ano, status)
select id, 2026, 'ativo' from public.escolas;

create policy "anos_letivos_select_same_escola" on public.anos_letivos
  for select using (escola_id = public.get_escola_id());

create policy "anos_letivos_write_admin" on public.anos_letivos
  using (escola_id = public.get_escola_id() and public.get_user_role() = 'administrador'::public.user_role)
  with check (escola_id = public.get_escola_id() and public.get_user_role() = 'administrador'::public.user_role);

-- ---------------------------------------------------------------------------
-- etapas_ciclos já existe (stub vazio, usado hoje como "Etapa/Ciclo" no
-- vínculo de turma do Cadastro de Usuário) — passa a representar também a
-- "Organização da oferta" do Cadastro de Turma, então precisa saber a qual
-- oferta cada linha pertence.
-- ---------------------------------------------------------------------------
alter table public.etapas_ciclos add column oferta_id uuid references public.ofertas(id);

insert into public.etapas_ciclos (escola_id, oferta_id, nome, ordem)
select e.id, o.id, v.nome, v.ordem
from public.escolas e
cross join (values
  ('ei', 'Estimulação Essencial', 1),
  ('ei', 'Pré-Escolar', 2),
  ('ef', '1º Ciclo', 1),
  ('ef', '2º Ciclo', 2),
  ('eja', 'Etapa única', 1),
  ('eja', 'Fase I', 2)
) as v(slug, nome, ordem)
join public.ofertas o on o.slug = v.slug;

-- Backfill das duas linhas de exemplo criadas por scripts/bootstrap-dev.ts
-- (dev, antes deste módulo existir) — mapeadas pra oferta mais próxima pelo
-- nome, pra não perder os vínculos de usuario_turmas que já apontam pra elas.
update public.etapas_ciclos set oferta_id = (select id from public.ofertas where slug = 'ei')
where nome = 'Educação Infantil' and oferta_id is null;

update public.etapas_ciclos set oferta_id = (select id from public.ofertas where slug = 'ef')
where nome = 'Ensino Fundamental I' and oferta_id is null;

alter table public.etapas_ciclos alter column oferta_id set not null;

-- ---------------------------------------------------------------------------
-- turnos — "Exibir apenas turnos ativos".
-- ---------------------------------------------------------------------------
alter table public.turnos add column ativo boolean not null default true;

-- ---------------------------------------------------------------------------
-- turmas — campos dos Blocos 1, 2, 3 e 6.
-- ---------------------------------------------------------------------------
alter table public.turmas
  add column oferta_id uuid references public.ofertas(id),
  add column matriz_curricular_id uuid references public.matrizes_curriculares(id),
  add column ano_letivo_id uuid references public.anos_letivos(id),
  add column capacidade integer,
  add column data_inicio date,
  add column data_fim date,
  add column observacoes text,
  add column campos_experiencias text[],
  add column direitos_aprendizagem text[],
  add column etapa_do_ciclo text,
  add column areas_conhecimento text[],
  add column unidades_ocupacionais text[],
  add column eixos_funcionais text[],
  add column objetivo_geral text;

-- Coluna solta nunca usada em código (o vínculo com o ano letivo agora é
-- ano_letivo_id, FK pra anos_letivos).
alter table public.turmas drop column ano_letivo;

-- Backfill das duas turmas de exemplo do bootstrap-dev.ts (uma delas já tem
-- vínculos reais de usuario_turmas criados em testes manuais — não dá pra
-- simplesmente apagar): oferta vem da etapa/ciclo já vinculada, matriz é a
-- primeira da oferta (arbitrário, ajustável depois pela tela real), ano
-- letivo é o 2026 ativo semeado acima, data de início é o começo do ano.
update public.turmas t
set
  oferta_id = ec.oferta_id,
  ano_letivo_id = al.id,
  data_inicio = date '2026-02-01'
from public.etapas_ciclos ec, public.anos_letivos al
where t.etapa_ciclo_id = ec.id
  and al.escola_id = t.escola_id and al.ano = 2026
  and t.oferta_id is null;

update public.turmas t
set matriz_curricular_id = (
  select mc.id from public.matrizes_curriculares mc where mc.oferta_id = t.oferta_id order by mc.nome limit 1
)
where t.matriz_curricular_id is null;

alter table public.turmas
  alter column oferta_id set not null,
  alter column matriz_curricular_id set not null,
  alter column ano_letivo_id set not null,
  alter column data_inicio set not null;

alter table public.turmas drop constraint turmas_status_check;
alter table public.turmas add constraint turmas_status_check
  check (status = any (array['ativa'::text, 'inativa'::text, 'encerrada'::text]));

-- "Não permitir duplicidade no mesmo ano, oferta e turno."
create unique index turmas_nome_unico
  on public.turmas (escola_id, ano_letivo_id, oferta_id, turno_id, lower(nome));

-- ---------------------------------------------------------------------------
-- Componentes curriculares vinculados à turma (obrigatório no Ensino
-- Fundamental, opcional na EJA) — mesmo padrão de usuario_turma_componentes.
-- ---------------------------------------------------------------------------
create table public.turma_componentes (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turmas(id) on delete cascade,
  componente_id uuid not null references public.componentes_curriculares(id),
  unique (turma_id, componente_id)
);

create policy "turma_componentes_select" on public.turma_componentes
  for select using (
    exists (
      select 1 from public.turmas t
      where t.id = turma_componentes.turma_id and t.escola_id = public.get_escola_id()
    )
  );

create policy "turma_componentes_write_admin" on public.turma_componentes
  using (
    exists (
      select 1 from public.turmas t
      where t.id = turma_componentes.turma_id and t.escola_id = public.get_escola_id()
    )
    and public.get_user_role() = 'administrador'::public.user_role
  )
  with check (
    exists (
      select 1 from public.turmas t
      where t.id = turma_componentes.turma_id and t.escola_id = public.get_escola_id()
    )
    and public.get_user_role() = 'administrador'::public.user_role
  );

-- ---------------------------------------------------------------------------
-- Auditoria de Turma — mesmo padrão de escolas_auditoria/usuarios_auditoria.
-- ---------------------------------------------------------------------------
create table public.turmas_auditoria (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turmas(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  alterado_por uuid references public.usuarios(id),
  alterado_em timestamptz not null default now()
);

create policy "turmas_auditoria_select_admin" on public.turmas_auditoria
  for select
  using (escola_id = public.get_escola_id() and public.get_user_role() = 'administrador'::public.user_role);

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

  return new;
end;
$$;

create trigger trg_turmas_audit
  after update on public.turmas
  for each row
  execute function public.audit_turmas_changes();
