-- Ajustes de "Organização da oferta" pedidos pelo cliente piloto:
--   * Educação Infantil: sai a organização "Educação Infantil" (linha antiga
--     criada por scripts/bootstrap-dev.ts) — ficam só Estimulação Essencial e
--     Pré-Escolar.
--   * EJA: "Etapa única" e "Fase I" viram uma só organização,
--     "EJA Fase 1 – Ed. Especial – Etapa Única".
-- As FKs para etapas_ciclos são RESTRICT/sem cascade, então tudo o que aponta
-- para as linhas que saem é remanejado antes do delete.

create temporary table _remap (de uuid primary key, para uuid not null) on commit drop;

-- EI: "Educação Infantil" → "Pré-Escolar" da mesma escola.
insert into _remap (de, para)
select velho.id, novo.id
from public.etapas_ciclos velho
join public.ofertas o on o.id = velho.oferta_id and o.slug = 'ei'
join public.etapas_ciclos novo
  on novo.escola_id = velho.escola_id and novo.oferta_id = velho.oferta_id and novo.nome = 'Pré-Escolar'
where velho.nome = 'Educação Infantil';

-- EJA: "Fase I" → "Etapa única" da mesma escola (renomeada logo abaixo).
insert into _remap (de, para)
select velho.id, novo.id
from public.etapas_ciclos velho
join public.ofertas o on o.id = velho.oferta_id and o.slug = 'eja'
join public.etapas_ciclos novo
  on novo.escola_id = velho.escola_id and novo.oferta_id = velho.oferta_id and novo.nome = 'Etapa única'
where velho.nome = 'Fase I';

update public.turmas t set etapa_ciclo_id = r.para
from _remap r where t.etapa_ciclo_id = r.de;

update public.avaliacoes_ingresso a set organizacao_pretendida_id = r.para
from _remap r where a.organizacao_pretendida_id = r.de;

update public.vinculos_escolares_anuais v set organizacao_atual_id = r.para
from _remap r where v.organizacao_atual_id = r.de;

delete from public.etapas_ciclos e using _remap r where e.id = r.de;

update public.etapas_ciclos e
set nome = 'EJA Fase 1 – Ed. Especial – Etapa Única', ordem = 1
from public.ofertas o
where o.id = e.oferta_id and o.slug = 'eja' and e.nome = 'Etapa única';
