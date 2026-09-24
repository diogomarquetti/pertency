-- Status do checklist documental deixa de ser um select livre: passa a ser
-- consequência de ações explícitas (ver documentos-actions.ts):
--   * enviar arquivo            → entregue, forma_entrega = 'arquivo'
--   * registrar entrega física  → entregue, forma_entrega = 'fisica'
--   * marcar "não se aplica"    → nao_se_aplica, com motivo obrigatório
--   * desfazer                  → pendente
-- "Não se aplica" automático (ex.: Histórico escolar quando a Forma de
-- origem é Primeira matrícula) é calculado na leitura, não gravado.
alter table public.documentos_estudante
  add column forma_entrega text check (forma_entrega in ('arquivo', 'fisica')),
  add column motivo_nao_se_aplica text;

-- Dados existentes: quem já tem arquivo passa a contar como entregue (a
-- regra nova); "entregue" sem arquivo vira entrega física — preserva o que
-- alguém já tinha registrado.
update public.documentos_estudante
set status = 'entregue', forma_entrega = 'arquivo'
where arquivo_path is not null and status in ('pendente', 'entregue') and tipo <> 'avaliacao_ingresso';

update public.documentos_estudante
set forma_entrega = 'fisica'
where status = 'entregue' and arquivo_path is null;
