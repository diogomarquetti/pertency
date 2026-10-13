-- Cliente piloto: a escola controla professores como Regente 1 e Regente 2.
-- Os dois perfis têm exatamente as mesmas permissões; o existente
-- `professor_regente` passa a ser exibido como "Professor(a) Regente 1".
-- Sozinho no arquivo pelo mesmo motivo de
-- 20260924090000_add_profissional_complementar_role.sql: o valor novo do enum
-- não pode ser usado na mesma transação do `add value`.
alter type public.user_role add value 'professor_regente_2' after 'professor_regente';
