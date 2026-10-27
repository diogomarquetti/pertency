-- Homepage (Início) — painéis laterais. Duas leituras que a RLS de
-- vinculos_escolares_anuais (só Admin, Secretaria e Coordenação) não deixa
-- fazer direto, então viram funções SECURITY DEFINER que devolvem só o
-- necessário, sempre escopadas à escola de quem chama.

-- Painel "Ocupação das turmas" (Direção): só totais por turma ativa, nenhum
-- dado de estudante. Ocupa vaga quem está Ativo com vínculo na turma.
-- PROVISÓRIO: validar com P.O se "Em análise de ingresso" já reserva vaga.
create or replace function public.ocupacao_turmas()
returns table (turma_id uuid, nome text, capacidade integer, ocupados integer)
language sql security definer stable
set search_path = public
as $$
  select
    t.id,
    t.nome,
    t.capacidade,
    (
      select count(*)::integer
      from public.vinculos_escolares_anuais v
      join public.estudantes e on e.id = v.estudante_id
      where v.turma_id = t.id and e.situacao = 'ativo'
    )
  from public.turmas t
  where t.escola_id = public.get_escola_id() and t.status = 'ativa'
  order by t.nome;
$$;

-- Painel "Sua turma" (professor): estudantes Ativos das turmas em que o
-- usuário logado tem vínculo ativo. Devolve só turma e estudante — os
-- alertas de rotina são lidos à parte, pela RLS normal de
-- perfil_funcional_estudante (que já restringe o professor aos seus alunos).
create or replace function public.meus_estudantes_por_turma()
returns table (turma_id uuid, estudante_id uuid, estudante_nome text)
language sql security definer stable
set search_path = public
as $$
  select ut.turma_id, e.id, e.nome_completo
  from public.usuario_turmas ut
  join public.turmas t on t.id = ut.turma_id
  join public.vinculos_escolares_anuais v on v.turma_id = ut.turma_id
  join public.estudantes e on e.id = v.estudante_id
  where ut.usuario_id = auth.uid()
    and ut.status = 'ativo'
    and t.escola_id = public.get_escola_id()
    and t.status = 'ativa'
    and e.situacao = 'ativo'
  order by e.nome_completo;
$$;

revoke execute on function public.ocupacao_turmas() from public, anon;
revoke execute on function public.meus_estudantes_por_turma() from public, anon;
grant execute on function public.ocupacao_turmas() to authenticated;
grant execute on function public.meus_estudantes_por_turma() to authenticated;
