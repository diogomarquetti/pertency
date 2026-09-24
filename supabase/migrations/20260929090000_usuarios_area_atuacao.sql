-- Área de atuação do usuário — o perfil de acesso ("Profissional
-- Complementar", "Administrador") não diz o que a pessoa faz. Relatórios da
-- Avaliação de Ingresso mostram a área no lugar do perfil quando preenchida
-- ("Fonoaudiologia" em vez de "Profissional Complementar").
-- Obrigatória para Profissional Complementar, opcional para Administrador e
-- Direção — regra aplicada na aplicação (schema zod), não aqui, pra não
-- travar cadastros antigos que ainda não têm a área.
-- Mesma lista de `avaliacao_contribuicoes.area_contribuicao`.
alter table public.usuarios
  add column area_atuacao text check (
    area_atuacao in (
      'servico_social', 'psicologia', 'fonoaudiologia', 'fisioterapia', 'terapia_ocupacional',
      'pedagogia', 'arte', 'educacao_fisica', 'outro'
    )
  ),
  add column area_atuacao_outro text;
