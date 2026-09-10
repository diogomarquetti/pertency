-- Cadastro de Turmas — Fase 2 (Bloco 4: Professores vinculados,
-- docs/requisitos/cadastro-turma.md seção 8).
--
-- usuario_turmas já existe (usado hoje pelo Cadastro de Usuário) mas não tem os dois campos que
-- a história pede pro vínculo visto do lado da turma: status do vínculo (ativo/inativo, sem
-- apagar o registro) e o escopo do professor na EJA (subconjunto das áreas/unidades/eixos que a
-- própria turma já tem selecionados no Bloco 3 — mesmo padrão text[] já usado em
-- turmas.areas_conhecimento etc., sem precisar de tabela nova).

alter table public.usuario_turmas
  add column status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  add column escopo_eja text[];

-- Evita vincular o mesmo professor duas vezes à mesma turma.
create unique index usuario_turmas_usuario_turma_unico
  on public.usuario_turmas (usuario_id, turma_id);
