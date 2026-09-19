alter table public.estudantes
  add column contato_emergencia_nome text,
  add column contato_emergencia_telefone text;

-- Texto livre antigo ("Nome e telefone") vai inteiro pra `nome`; telefone fica
-- vazio e passa a ser exigido no próximo salvamento do cadastro.
update public.estudantes
set contato_emergencia_nome = contato_emergencia
where contato_emergencia is not null;

alter table public.estudantes drop column contato_emergencia;
