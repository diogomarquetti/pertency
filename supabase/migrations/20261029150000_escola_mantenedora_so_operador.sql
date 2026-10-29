-- Dados da escola e da mantenedora passam a ser mantidos só pela equipe
-- Pertency, no admin da plataforma (políticas *_update_operador). O
-- administrador da escola continua lendo os dois cadastros em Configurações.
--
-- Remove as políticas transitórias deixadas em
-- 20261029120100_escola_seleciona_mantenedora.sql.

drop policy if exists "escolas_update_admin" on public.escolas;
drop policy if exists "mantenedoras_update_admin" on public.mantenedoras;
