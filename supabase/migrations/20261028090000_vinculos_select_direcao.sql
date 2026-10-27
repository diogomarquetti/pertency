-- Direção passa a ler vinculos_escolares_anuais. A HU do Cadastro de
-- Estudante dá à Direção "consulta ampla", mas a policy de select só
-- incluía Admin, Secretaria e Coordenação — por isso a Direção via
-- "Estudantes vinculados" vazio na tela da turma (e os dados do vínculo
-- anual vazios no estudante). Escrita continua restrita aos mesmos três.

drop policy "vinculos_escolares_anuais_select_staff" on public.vinculos_escolares_anuais;
create policy "vinculos_escolares_anuais_select_staff" on public.vinculos_escolares_anuais
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'direcao', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );
