-- Reestruturação da Avaliação de Ingresso — HU-EST-001 v2.0, seção 11.2:
-- "Contexto" (Bloco 5) quebra em 5 campos, "Áreas de apoio" (Bloco 7),
-- "Justificativa" e "Encaminhamento recomendado" (Bloco 10) passam a
-- existir.

alter table public.avaliacoes_ingresso
  add column contexto_escolar text,
  add column contexto_familiar text,
  add column contexto_comunitario text,
  add column fatores_facilitadores text,
  add column barreiras_identificadas text,
  add column areas_apoio text[],
  add column justificativa_elegibilidade text,
  add column encaminhamento_recomendado text check (
    encaminhamento_recomendado in (
      'efetivar_matricula', 'rede_regular_com_apoios', 'orientar_familia',
      'solicitar_complementacao', 'outro'
    )
  );

-- Realoca o texto já escrito em dimensao_contexto (campo único que essa
-- coluna substitui) antes de descartá-la — não perde conteúdo já digitado.
update public.avaliacoes_ingresso
set contexto_escolar = dimensao_contexto
where dimensao_contexto is not null and dimensao_contexto <> '';

alter table public.avaliacoes_ingresso drop column dimensao_contexto;
