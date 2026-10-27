-- Notificações: "Entrou na sua turma" e "Saiu da sua turma" do mesmo
-- estudante se anulam enquanto não lidas — tirar e devolver um estudante
-- (ex.: correção de cadastro) não deixa dois avisos contraditórios no sino.

create or replace function public.notificar_entrada_saida(
  p_escola_id uuid,
  p_destinatarios uuid[],
  p_tipo text,
  p_estudante_id uuid,
  p_destino text,
  p_dados jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anulados uuid[];
begin
  with removidas as (
    delete from public.notificacoes
    where tipo = case p_tipo when 'estudante_entrou_turma' then 'estudante_saiu_turma' else 'estudante_entrou_turma' end
      and entidade_id = p_estudante_id
      and lida_em is null
      and destinatario_id = any(p_destinatarios)
    returning destinatario_id
  )
  select coalesce(array_agg(destinatario_id), '{}') into v_anulados from removidas;

  perform public.notificar(
    p_escola_id,
    array(select unnest(p_destinatarios) except select unnest(v_anulados)),
    p_tipo,
    p_estudante_id,
    p_destino,
    p_dados
  );
end;
$$;

revoke execute on function public.notificar_entrada_saida(uuid, uuid[], text, uuid, text, jsonb) from public, anon, authenticated;

create or replace function public.notificar_turma_estudante()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nome text;
begin
  if tg_op = 'UPDATE' and new.turma_id is not distinct from old.turma_id then
    return new;
  end if;

  select nome_completo into v_nome from public.estudantes where id = new.estudante_id;

  if new.turma_id is not null then
    perform public.notificar_entrada_saida(
      new.escola_id,
      public.professores_da_turma(new.turma_id),
      'estudante_entrou_turma',
      new.estudante_id,
      '/estudantes/' || new.estudante_id,
      jsonb_build_object(
        'estudante', v_nome,
        'turma', (select nome from public.turmas where id = new.turma_id)
      )
    );
  end if;

  if tg_op = 'UPDATE' and old.turma_id is not null then
    perform public.notificar_entrada_saida(
      new.escola_id,
      public.professores_da_turma(old.turma_id),
      'estudante_saiu_turma',
      new.estudante_id,
      '/turmas/' || old.turma_id || '/editar',
      jsonb_build_object(
        'estudante', v_nome,
        'turma', (select nome from public.turmas where id = old.turma_id)
      )
    );
  end if;

  return new;
end;
$$;
