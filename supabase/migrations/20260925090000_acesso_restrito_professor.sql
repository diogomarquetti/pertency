-- Onda 4 (fatia 3, última) — Acesso restrito de professor.
-- docs/requisitos/cadastro-estudante.md §6/§19, CA31: professor só vê
-- estudantes vinculados à sua turma; docs/requisitos/cadastro-usuario.md
-- regra 14, mesma exigência. Também fecha o gap deixado explicitamente na
-- fatia anterior (Perfil profissional complementar): leitura ampla nunca
-- foi restringida pra esse perfil, só a escrita.
--
-- 6 tabelas tinham select totalmente aberto (escola_id = get_escola_id(),
-- sem checar função): estudantes, avaliacoes_ingresso,
-- avaliacao_contribuicoes, avaliacao_relatorios, condicoes_estudante,
-- perfil_funcional_estudante. As demais tabelas do módulo já eram
-- staff-only desde que foram criadas — nada muda nelas.

-- Professor: estudante aparece se está numa turma vinculada ao professor
-- (usuario_turmas), pelo vínculo do ano letivo (vinculos_escolares_anuais).
-- Ignora usuario_turma_componentes de propósito — a HU fala em "turma
-- vinculada", não em componente curricular específico.
create or replace function public.professor_pode_ver_estudante(p_estudante_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1
    from public.usuario_turmas ut
    join public.vinculos_escolares_anuais v on v.turma_id = ut.turma_id
    where ut.usuario_id = auth.uid() and v.estudante_id = p_estudante_id
  );
$$;

-- Profissional complementar: estudante aparece se ele está na equipe
-- responsável da Avaliação de Ingresso ou já tem contribuição lançada nela
-- (mesmo vínculo já usado na escrita, ver migration
-- 20260924090100_perfil_profissional_complementar.sql).
create or replace function public.profissional_complementar_pode_ver_estudante(p_estudante_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.avaliacoes_ingresso ai
    where ai.estudante_id = p_estudante_id
      and (
        auth.uid() = any(ai.equipe_responsavel_ids)
        or exists (
          select 1 from public.avaliacao_contribuicoes ac
          where ac.avaliacao_id = ai.id and ac.profissional_id = auth.uid()
        )
      )
  );
$$;

-- Ponto único usado pelas 6 policies abaixo — qualquer perfil fora dos dois
-- restritos continua sempre `true`, então administrador/direção/secretaria/
-- coordenação ficam com o mesmo acesso de sempre.
create or replace function public.pode_ver_estudante_restrito(p_estudante_id uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select case public.get_user_role()
    when 'professor_regente' then public.professor_pode_ver_estudante(p_estudante_id)
    when 'professor_arte' then public.professor_pode_ver_estudante(p_estudante_id)
    when 'professor_educacao_fisica' then public.professor_pode_ver_estudante(p_estudante_id)
    when 'profissional_complementar' then public.profissional_complementar_pode_ver_estudante(p_estudante_id)
    else true
  end;
$$;

drop policy "estudantes_select_same_escola" on public.estudantes;
create policy "estudantes_select_same_escola" on public.estudantes
  for select using (
    escola_id = public.get_escola_id()
    and public.pode_ver_estudante_restrito(id)
  );

drop policy "avaliacoes_ingresso_select_same_escola" on public.avaliacoes_ingresso;
create policy "avaliacoes_ingresso_select_same_escola" on public.avaliacoes_ingresso
  for select using (
    escola_id = public.get_escola_id()
    and public.pode_ver_estudante_restrito(estudante_id)
  );

drop policy "condicoes_estudante_select_same_escola" on public.condicoes_estudante;
create policy "condicoes_estudante_select_same_escola" on public.condicoes_estudante
  for select using (
    escola_id = public.get_escola_id()
    and public.pode_ver_estudante_restrito(estudante_id)
  );

drop policy "perfil_funcional_estudante_select_same_escola" on public.perfil_funcional_estudante;
create policy "perfil_funcional_estudante_select_same_escola" on public.perfil_funcional_estudante
  for select using (
    escola_id = public.get_escola_id()
    and public.pode_ver_estudante_restrito(estudante_id)
  );

drop policy "avaliacao_relatorios_select_same_escola" on public.avaliacao_relatorios;
create policy "avaliacao_relatorios_select_same_escola" on public.avaliacao_relatorios
  for select using (
    escola_id = public.get_escola_id()
    and public.pode_ver_estudante_restrito(estudante_id)
  );

-- Única sem estudante_id direto — só avaliacao_id.
drop policy "avaliacao_contribuicoes_select_same_escola" on public.avaliacao_contribuicoes;
create policy "avaliacao_contribuicoes_select_same_escola" on public.avaliacao_contribuicoes
  for select using (
    escola_id = public.get_escola_id()
    and public.pode_ver_estudante_restrito(
      (select estudante_id from public.avaliacoes_ingresso where id = avaliacao_contribuicoes.avaliacao_id)
    )
  );
