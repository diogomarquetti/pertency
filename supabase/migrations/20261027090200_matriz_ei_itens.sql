-- Turma de Educação Infantil (retorno do P.O, seção 3): Campos de
-- Experiências, Direitos de Aprendizagem e Eixos Estruturantes deixam de ser
-- escolhidos na turma e passam a vir da matriz curricular (a escolha
-- pedagógica acontece no Planejamento).

alter table public.matrizes_curriculares
  add column campos_experiencias text[],
  add column direitos_aprendizagem text[],
  add column eixos_estruturantes text[];

update public.matrizes_curriculares m
set
  campos_experiencias = array[
    'O eu, o outro e o nós',
    'Corpo, gestos e movimentos',
    'Escuta, fala, pensamento e imaginação',
    'Traços, sons, cores e formas',
    'Espaços, tempos, quantidades, relações e transformações'
  ],
  direitos_aprendizagem = array['Conviver', 'Brincar', 'Participar', 'Explorar', 'Expressar', 'Conhecer-se'],
  eixos_estruturantes = array['Interações e Brincadeiras']
from public.ofertas o
where o.id = m.oferta_id and o.slug = 'ei';
