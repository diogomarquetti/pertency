-- Ajustes da reunião com o P.O (2026-11-10) no cadastro de estudantes.
--
-- Nova situação "A matricular": a Avaliação de Ingresso concluída como
-- elegível, com encaminhamento "Efetivar matrícula", leva o estudante para
-- "A matricular" (o app faz a transição). A Secretaria completa os Dados
-- escolares (turma, matrícula, data) e aí ele vira "Ativo". Só "Ativo"
-- ocupa vaga na turma, por isso a efetivação não é automática na conclusão.
-- PROVISÓRIO: validar com P.O.
--
-- "nao_elegivel" continua existindo como resultado definido pelo sistema
-- (conclusão como não elegível); não aparece como opção manual.

do $$
declare
  v_nome text;
begin
  for v_nome in
    select conname from pg_constraint
    where conrelid = 'public.estudantes'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%situacao%'
  loop
    execute format('alter table public.estudantes drop constraint %I', v_nome);
  end loop;
end $$;

alter table public.estudantes
  add constraint estudantes_situacao_check check (
    situacao in (
      'em_analise_de_ingresso', 'a_matricular', 'ativo', 'nao_elegivel',
      'transferido', 'desligado', 'inativo'
    )
  );

-- Quem já estava elegível e aguardando a Secretaria passa para "A matricular"
-- (era o que a pendência "Concluir matrícula" já tratava como esse estado).
-- Sem encaminhamento informado conta como matrícula: o campo era opcional.
update public.estudantes e
set situacao = 'a_matricular'
where e.situacao = 'em_analise_de_ingresso'
  and exists (
    select 1 from public.avaliacoes_ingresso a
    where a.estudante_id = e.id
      and a.status_avaliacao = 'concluida'
      and a.recomendacao_elegibilidade = 'elegivel'
      and coalesce(a.encaminhamento_recomendado, 'efetivar_matricula') = 'efetivar_matricula'
  );
