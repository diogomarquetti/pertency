-- Filiação deixa de ser texto livre ("Fabiula e Marcio") e vira dois campos,
-- Mãe e Pai — preenchidos por sugestão a partir dos responsáveis com esse
-- parentesco, mas editáveis (filiação e responsável legal não são sempre a
-- mesma pessoa). O texto antigo era só dado de teste e não é migrado.
alter table public.estudantes
  add column filiacao_mae text,
  add column filiacao_pai text;

alter table public.estudantes drop column filiacao;
