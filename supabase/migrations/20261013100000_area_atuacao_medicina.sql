-- Lista de Áreas (Cadastro de Usuário / Contribuição complementar): saem Arte
-- e Educação Física — já existem como funções próprias (professor_arte,
-- professor_educacao_fisica) — e entra Medicina. Nenhum registro usava as
-- áreas removidas quando esta migration foi escrita.
alter table public.usuarios
  drop constraint usuarios_area_atuacao_check,
  add constraint usuarios_area_atuacao_check check (
    area_atuacao in (
      'servico_social', 'psicologia', 'fonoaudiologia', 'fisioterapia', 'terapia_ocupacional',
      'pedagogia', 'medicina', 'outro'
    )
  );

alter table public.avaliacao_contribuicoes
  drop constraint avaliacao_contribuicoes_area_contribuicao_check,
  add constraint avaliacao_contribuicoes_area_contribuicao_check check (
    area_contribuicao in (
      'servico_social', 'psicologia', 'fonoaudiologia', 'fisioterapia', 'terapia_ocupacional',
      'pedagogia', 'medicina', 'outro'
    )
  );
