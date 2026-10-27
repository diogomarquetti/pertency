-- Configuração central de ofertas (retorno do P.O, seção 1). As regras de
-- cada organização (código SERE, forma de funcionamento, ciclo) vivem em
-- lib/ofertas-config.ts; aqui cada linha de etapas_ciclos ganha o `codigo`
-- que aponta pra lá. Linha sem código = organização descontinuada: continua
-- referenciada por registros antigos, mas some das listas de seleção.
-- Nada é apagado.

alter table public.etapas_ciclos add column codigo text;

create unique index etapas_ciclos_escola_codigo_unico
  on public.etapas_ciclos (escola_id, codigo)
  where codigo is not null;

-- Educação Infantil: as duas organizações já existem.
update public.etapas_ciclos e set codigo = 'ei_estimulacao_essencial'
from public.ofertas o
where o.id = e.oferta_id and o.slug = 'ei' and e.nome = 'Estimulação Essencial';

update public.etapas_ciclos e set codigo = 'ei_pre_escolar'
from public.ofertas o
where o.id = e.oferta_id and o.slug = 'ei' and e.nome = 'Pré-Escolar';

-- EJA: a organização unificada em 20261013090000 é a Educação Especial –
-- Etapa Única (SERE 6054).
update public.etapas_ciclos e
set codigo = 'eja_fase_1_especial', nome = 'EJA Fase I – Educação Especial – Etapa Única', ordem = 2
from public.ofertas o
where o.id = e.oferta_id and o.slug = 'eja' and e.nome = 'EJA Fase 1 – Ed. Especial – Etapa Única';

-- Organizações novas, uma por escola.
insert into public.etapas_ciclos (escola_id, oferta_id, nome, ordem, codigo)
select esc.id, o.id, v.nome, v.ordem, v.codigo
from public.escolas esc
cross join (values
  ('ef', 'Ciclo Contínuo – Multietapas', 1, 'ef_ciclo_continuo'),
  ('eja', 'EJA Fase I', 1, 'eja_fase_1')
) as v(slug, nome, ordem, codigo)
join public.ofertas o on o.slug = v.slug
on conflict do nothing;

-- "1º Ciclo", "2º Ciclo" e "Ensino Fundamental I" ficam sem código
-- (descontinuadas). Os ciclos passam a ser um campo próprio da turma.

-- Nome da oferta conforme a tabela do P.O ("EJA"; as organizações é que
-- dizem Fase I / Educação Especial).
update public.ofertas set nome = 'EJA' where slug = 'eja';
