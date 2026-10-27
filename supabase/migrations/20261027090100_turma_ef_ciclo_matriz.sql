-- Turma de Ensino Fundamental (retorno do P.O, seção 2): Ciclo e Etapas
-- passam a ser campos da turma; áreas e componentes vêm da matriz
-- curricular vinculada (não são mais escolhidos na turma).

alter table public.turmas
  add column ciclo smallint check (ciclo in (1, 2)),
  add column etapas smallint[];

-- Matriz do EF é por ciclo (1º Ciclo → Matriz EF – 1º Ciclo, etc.).
alter table public.matrizes_curriculares
  add column ciclo smallint check (ciclo in (1, 2));

update public.matrizes_curriculares set ciclo = 1 where nome = 'Matriz EF — 1º Ciclo';
update public.matrizes_curriculares set ciclo = 2 where nome = 'Matriz EF — 2º Ciclo';

-- Componentes curriculares de cada matriz, agrupados por área.
create table public.matriz_componentes (
  matriz_id uuid not null references public.matrizes_curriculares(id) on delete cascade,
  componente_id uuid not null references public.componentes_curriculares(id),
  area text not null,
  ordem integer not null default 0,
  primary key (matriz_id, componente_id)
);

create policy "matriz_componentes_select_all" on public.matriz_componentes
  for select using (auth.role() = 'authenticated');

-- PROVISÓRIO: validar com P.O — as duas matrizes do EF recebem os mesmos 7
-- componentes até a composição de cada matriz ser definida.
insert into public.matriz_componentes (matriz_id, componente_id, area, ordem)
select m.id, c.id, v.area, v.ordem
from public.matrizes_curriculares m
cross join (values
  ('Português', 'Linguagens', 1),
  ('Arte', 'Linguagens', 2),
  ('Educação Física', 'Linguagens', 3),
  ('Matemática', 'Matemática', 4),
  ('Ciências', 'Ciências da Natureza', 5),
  ('Geografia', 'Ciências Humanas', 6),
  ('História', 'Ciências Humanas', 7)
) as v(componente, area, ordem)
join public.componentes_curriculares c on c.nome = v.componente
where m.ciclo is not null;
