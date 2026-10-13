-- Regente 2 tem o mesmo acesso restrito do Regente 1 (professor_regente):
-- só vê estudantes das turmas a que está vinculado. Única regra de banco
-- que diferencia perfis de professor — as demais policies só listam os
-- perfis de staff, que continuam iguais.
create or replace function public.pode_ver_estudante_restrito(p_estudante_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select case public.get_user_role()
    when 'professor_regente' then public.professor_pode_ver_estudante(p_estudante_id)
    when 'professor_regente_2' then public.professor_pode_ver_estudante(p_estudante_id)
    when 'professor_arte' then public.professor_pode_ver_estudante(p_estudante_id)
    when 'professor_educacao_fisica' then public.professor_pode_ver_estudante(p_estudante_id)
    when 'profissional_complementar' then public.profissional_complementar_pode_ver_estudante(p_estudante_id)
    else true
  end;
$$;
