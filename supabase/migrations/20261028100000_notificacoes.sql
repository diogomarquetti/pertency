-- Notificações do sino (Onda 1). Diferente das pendências da homepage —
-- calculadas na leitura a partir do estado —, notificação é um
-- acontecimento: alguém fez algo que muda o trabalho de outra pessoa. Por
-- isso é gravada na hora, por trigger, e cada destinatário marca a sua como
-- lida. Quem recebe é decidido aqui, no momento do evento (ex.: "quem dá
-- aula nesta turma"), porque boa parte dessas tabelas não é legível pelo
-- destinatário via RLS.
--
-- Regras:
-- * quem fez a ação nunca é notificado (auth.uid());
-- * só usuários ativos da mesma escola recebem;
-- * notificação ainda não lida do mesmo tipo e mesmo registro é agrupada
--   (incrementa `quantidade` e volta ao topo) em vez de duplicar;
-- * `dados` guarda só nomes curtos para o texto (estudante, turma,
--   profissional) — nunca conteúdo clínico nem o texto do alerta.

create table public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas(id),
  destinatario_id uuid not null references public.usuarios(id) on delete cascade,
  tipo text not null,
  entidade_id uuid not null,
  dados jsonb not null default '{}'::jsonb,
  destino text not null,
  quantidade integer not null default 1,
  ator_id uuid references public.usuarios(id) on delete set null,
  criada_em timestamptz not null default now(),
  lida_em timestamptz
);

create index notificacoes_destinatario_criada_em
  on public.notificacoes (destinatario_id, criada_em desc);

create unique index notificacoes_nao_lida_unica
  on public.notificacoes (destinatario_id, tipo, entidade_id)
  where lida_em is null;

alter table public.notificacoes enable row level security;

create policy "notificacoes_select_proprias" on public.notificacoes
  for select using (destinatario_id = auth.uid() and escola_id = public.get_escola_id());

create policy "notificacoes_update_proprias" on public.notificacoes
  for update using (destinatario_id = auth.uid() and escola_id = public.get_escola_id())
  with check (destinatario_id = auth.uid() and escola_id = public.get_escola_id());

-- Nenhuma escrita direta além de marcar como lida: inserts só pelos
-- triggers abaixo (via notificar()), e o update só alcança `lida_em`.
revoke insert, update, delete on public.notificacoes from anon, authenticated;
grant update (lida_em) on public.notificacoes to authenticated;

-- ---------------------------------------------------------------------------
-- Funções auxiliares
-- ---------------------------------------------------------------------------
create or replace function public.notificar(
  p_escola_id uuid,
  p_destinatarios uuid[],
  p_tipo text,
  p_entidade_id uuid,
  p_destino text,
  p_dados jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notificacoes (escola_id, destinatario_id, tipo, entidade_id, dados, destino, ator_id)
  select distinct p_escola_id, u.id, p_tipo, p_entidade_id, p_dados, p_destino, auth.uid()
  from public.usuarios u
  where u.id = any(p_destinatarios)
    and u.escola_id = p_escola_id
    and u.status = 'ativo'
    and u.id is distinct from auth.uid()
  on conflict (destinatario_id, tipo, entidade_id) where lida_em is null
  do update set
    quantidade = public.notificacoes.quantidade + 1,
    dados = excluded.dados,
    destino = excluded.destino,
    ator_id = excluded.ator_id,
    criada_em = now();
end;
$$;

-- Professores com vínculo ativo na turma (mesmo critério do painel "Sua turma").
create or replace function public.professores_da_turma(p_turma_id uuid)
returns uuid[]
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(array_agg(ut.usuario_id), '{}')
  from public.usuario_turmas ut
  where ut.turma_id = p_turma_id and ut.status = 'ativo';
$$;

-- Professores das turmas em que o estudante tem vínculo.
create or replace function public.professores_do_estudante(p_estudante_id uuid)
returns uuid[]
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(array_agg(distinct ut.usuario_id), '{}')
  from public.vinculos_escolares_anuais v
  join public.turmas t on t.id = v.turma_id and t.status = 'ativa'
  join public.usuario_turmas ut on ut.turma_id = v.turma_id and ut.status = 'ativo'
  where v.estudante_id = p_estudante_id;
$$;

revoke execute on function public.notificar(uuid, uuid[], text, uuid, text, jsonb) from public, anon, authenticated;
revoke execute on function public.professores_da_turma(uuid) from public, anon, authenticated;
revoke execute on function public.professores_do_estudante(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1. Alerta de rotina atualizado → professores da turma do estudante.
-- Mesmos campos de alerta do painel "Sua turma" que dizem respeito a
-- segurança: alergia, medicação, situação de atenção, segurança e cuidados.
-- ---------------------------------------------------------------------------
create or replace function public.notificar_alerta_rotina()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mudou boolean;
  v_estudante public.estudantes%rowtype;
begin
  if tg_op = 'INSERT' then
    v_mudou := coalesce(new.alergias_restricoes, '') <> ''
      or coalesce(new.necessita_medicacao, false)
      or coalesce(new.situacoes_atencao, '') <> ''
      or coalesce(new.seguranca_cuidados, '') <> '';
  else
    v_mudou := new.alergias_restricoes is distinct from old.alergias_restricoes
      or new.necessita_medicacao is distinct from old.necessita_medicacao
      or new.medicacao_detalhes is distinct from old.medicacao_detalhes
      or new.situacoes_atencao is distinct from old.situacoes_atencao
      or new.seguranca_cuidados is distinct from old.seguranca_cuidados;
  end if;

  if not v_mudou then
    return new;
  end if;

  select * into v_estudante from public.estudantes where id = new.estudante_id;
  if v_estudante.situacao <> 'ativo' then
    return new;
  end if;

  perform public.notificar(
    new.escola_id,
    public.professores_do_estudante(new.estudante_id),
    'alerta_rotina_atualizado',
    new.estudante_id,
    '/estudantes/' || new.estudante_id,
    jsonb_build_object('estudante', v_estudante.nome_completo)
  );

  return new;
end;
$$;

create trigger trg_perfil_funcional_estudante_notificar
  after insert or update on public.perfil_funcional_estudante
  for each row execute function public.notificar_alerta_rotina();

-- ---------------------------------------------------------------------------
-- 2. Estudante entrou / saiu da turma → professores da turma.
-- Entrada e troca de turma vêm do vínculo anual; saída da escola
-- (transferido, desligado, inativo) vem da situação do estudante.
-- ---------------------------------------------------------------------------
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
    perform public.notificar(
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
    perform public.notificar(
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

create trigger trg_vinculos_escolares_anuais_notificar
  after insert or update of turma_id on public.vinculos_escolares_anuais
  for each row execute function public.notificar_turma_estudante();

create or replace function public.notificar_saida_estudante()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.situacao = 'ativo' and new.situacao in ('transferido', 'desligado', 'inativo') then
    perform public.notificar(
      new.escola_id,
      public.professores_do_estudante(new.id),
      'estudante_saiu_turma',
      new.id,
      '/estudantes/' || new.id,
      jsonb_build_object('estudante', new.nome_completo)
    );
  end if;

  return new;
end;
$$;

create trigger trg_estudantes_notificar_saida
  after update of situacao on public.estudantes
  for each row execute function public.notificar_saida_estudante();

-- ---------------------------------------------------------------------------
-- 3. Professor vinculado a uma turma → o próprio professor.
-- ---------------------------------------------------------------------------
create or replace function public.notificar_vinculo_professor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_turma public.turmas%rowtype;
begin
  if new.status <> 'ativo' or (tg_op = 'UPDATE' and old.status = 'ativo') then
    return new;
  end if;

  select * into v_turma from public.turmas where id = new.turma_id;

  perform public.notificar(
    v_turma.escola_id,
    array[new.usuario_id],
    'vinculado_turma',
    new.turma_id,
    '/turmas/' || new.turma_id || '/editar',
    jsonb_build_object('turma', v_turma.nome)
  );

  return new;
end;
$$;

create trigger trg_usuario_turmas_notificar
  after insert or update of status on public.usuario_turmas
  for each row execute function public.notificar_vinculo_professor();

-- ---------------------------------------------------------------------------
-- 4. Incluído(a) na equipe da Avaliação de Ingresso → novos profissionais
-- complementares da equipe (os únicos que contribuem, pela RLS). Uma nova
-- versão (retificação) herda a equipe da anterior: só avisa quem entrou.
-- ---------------------------------------------------------------------------
create or replace function public.notificar_equipe_avaliacao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anteriores uuid[];
  v_novos uuid[];
begin
  if new.status_avaliacao not in ('rascunho', 'em_andamento') then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    v_anteriores := coalesce(old.equipe_responsavel_ids, '{}');
  else
    select coalesce(equipe_responsavel_ids, '{}') into v_anteriores
    from public.avaliacoes_ingresso where id = new.avaliacao_origem_id;
    v_anteriores := coalesce(v_anteriores, '{}');
  end if;

  select coalesce(array_agg(u.id), '{}') into v_novos
  from public.usuarios u
  where u.id = any(coalesce(new.equipe_responsavel_ids, '{}'))
    and not (u.id = any(v_anteriores))
    and u.funcao = 'profissional_complementar';

  if cardinality(v_novos) > 0 then
    perform public.notificar(
      new.escola_id,
      v_novos,
      'incluido_equipe_avaliacao',
      new.id,
      '/estudantes/' || new.estudante_id || '/editar?aba=avaliacao#contribuicoes',
      jsonb_build_object('estudante', (select nome_completo from public.estudantes where id = new.estudante_id))
    );
  end if;

  return new;
end;
$$;

create trigger trg_avaliacoes_ingresso_notificar_equipe
  after insert or update of equipe_responsavel_ids on public.avaliacoes_ingresso
  for each row execute function public.notificar_equipe_avaliacao();

-- ---------------------------------------------------------------------------
-- 5. Contribuição registrada → Pedagogo(a) da equipe (se a equipe não tiver,
-- todos os pedagogos da escola). Quando chega a última contribuição dos
-- complementares da equipe, vira "Contribuições completas" e substitui o
-- aviso de contribuição ainda não lido.
-- PROVISÓRIO: validar com P.O — destinatários.
-- ---------------------------------------------------------------------------
create or replace function public.notificar_contribuicao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avaliacao public.avaliacoes_ingresso%rowtype;
  v_pedagogos uuid[];
  v_faltam integer;
  v_destino text;
  v_dados jsonb;
begin
  select * into v_avaliacao from public.avaliacoes_ingresso where id = new.avaliacao_id;

  select coalesce(array_agg(u.id), '{}') into v_pedagogos
  from public.usuarios u
  where u.id = any(coalesce(v_avaliacao.equipe_responsavel_ids, '{}'))
    and u.funcao = 'coordenacao_pedagogica';

  if cardinality(v_pedagogos) = 0 then
    select coalesce(array_agg(u.id), '{}') into v_pedagogos
    from public.usuarios u
    where u.escola_id = new.escola_id and u.funcao = 'coordenacao_pedagogica';
  end if;

  select count(*) into v_faltam
  from public.usuarios u
  where u.id = any(coalesce(v_avaliacao.equipe_responsavel_ids, '{}'))
    and u.funcao = 'profissional_complementar'
    and u.status = 'ativo'
    and not exists (
      select 1 from public.avaliacao_contribuicoes ac
      where ac.avaliacao_id = new.avaliacao_id and ac.profissional_id = u.id
    );

  v_destino := '/estudantes/' || v_avaliacao.estudante_id || '/editar?aba=avaliacao';
  v_dados := jsonb_build_object(
    'estudante', (select nome_completo from public.estudantes where id = v_avaliacao.estudante_id),
    'profissional', (select nome_completo from public.usuarios where id = new.profissional_id)
  );

  if v_faltam = 0 then
    delete from public.notificacoes
    where tipo = 'contribuicao_registrada'
      and entidade_id = new.avaliacao_id
      and lida_em is null
      and destinatario_id = any(v_pedagogos);

    perform public.notificar(
      new.escola_id, v_pedagogos, 'contribuicoes_completas', new.avaliacao_id, v_destino || '#parecer', v_dados
    );
  else
    perform public.notificar(
      new.escola_id, v_pedagogos, 'contribuicao_registrada', new.avaliacao_id, v_destino || '#contribuicoes', v_dados
    );
  end if;

  return new;
end;
$$;

create trigger trg_avaliacao_contribuicoes_notificar
  after insert on public.avaliacao_contribuicoes
  for each row execute function public.notificar_contribuicao();

-- ---------------------------------------------------------------------------
-- 6. Avaliação concluída → Secretaria (próximo passo é a matrícula) e quem
-- da equipe consegue ler a avaliação (professor não lê estudante em
-- ingresso, então fica de fora).
-- ---------------------------------------------------------------------------
create or replace function public.notificar_avaliacao_concluida()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secretaria uuid[];
  v_equipe uuid[];
  v_dados jsonb;
begin
  if new.status_avaliacao <> 'concluida' or old.status_avaliacao = 'concluida' then
    return new;
  end if;

  v_dados := jsonb_build_object(
    'estudante', (select nome_completo from public.estudantes where id = new.estudante_id),
    'elegibilidade', new.recomendacao_elegibilidade
  );

  select coalesce(array_agg(u.id), '{}') into v_secretaria
  from public.usuarios u
  where u.escola_id = new.escola_id and u.funcao = 'secretaria';

  select coalesce(array_agg(u.id), '{}') into v_equipe
  from public.usuarios u
  where u.id = any(coalesce(new.equipe_responsavel_ids, '{}'))
    and u.funcao in ('profissional_complementar', 'coordenacao_pedagogica', 'direcao', 'administrador')
    and not (u.id = any(v_secretaria));

  perform public.notificar(
    new.escola_id,
    v_secretaria,
    'avaliacao_concluida',
    new.id,
    case
      when new.recomendacao_elegibilidade = 'elegivel'
        then '/estudantes/' || new.estudante_id || '/editar?aba=dados-escolares'
      else '/estudantes/' || new.estudante_id
    end,
    v_dados
  );

  perform public.notificar(
    new.escola_id,
    v_equipe,
    'avaliacao_concluida',
    new.id,
    '/estudantes/' || new.estudante_id || '/editar?aba=avaliacao',
    v_dados
  );

  return new;
end;
$$;

create trigger trg_avaliacoes_ingresso_notificar_conclusao
  after update of status_avaliacao on public.avaliacoes_ingresso
  for each row execute function public.notificar_avaliacao_concluida();
