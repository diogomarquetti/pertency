-- Escola nova nasce com os dados de referência que o cadastro de turmas exige
-- (turnos, ano letivo e organizações das ofertas). Antes isso só existia nas
-- escolas montadas por script, e o administrador de uma escola criada pelo
-- admin da plataforma não conseguia cadastrar turma.
--
-- PROVISÓRIO (validar com P.O): turnos Manhã e Tarde; o administrador da
-- escola ainda não tem tela para ajustar turnos.

create or replace function public.provisionar_escola_referencia(p_escola_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.turnos (escola_id, nome)
  values (p_escola_id, 'Manhã'), (p_escola_id, 'Tarde')
  on conflict (escola_id, nome) do nothing;

  insert into public.anos_letivos (escola_id, ano, status)
  values (p_escola_id, extract(year from now())::int, 'ativo')
  on conflict (escola_id, ano) do nothing;

  -- Organizações ativas, as mesmas de OFERTAS_SERE em lib/ofertas-config.ts.
  insert into public.etapas_ciclos (escola_id, nome, ordem, oferta_id, codigo)
  select p_escola_id, v.nome, v.ordem, o.id, v.codigo
  from (values
    ('ei',                  'Estimulação Essencial',                          1, 'ei_estimulacao_essencial'),
    ('ei',                  'Pré-Escolar',                                    2, 'ei_pre_escolar'),
    ('aee_infantil',        'Apoio Educacional Infantil Especializado',       1, 'aee_infantil'),
    ('ef',                  'Ciclo Contínuo – Multietapas',                   1, 'ef_ciclo_continuo'),
    ('eja',                 'EJA Fase I',                                     1, 'eja_fase_1'),
    ('eja',                 'EJA Fase I – Educação Especial – Etapa Única',   2, 'eja_fase_1_especial'),
    ('curriculo_funcional', 'Programa Pedagógico do Currículo Funcional',     1, 'curriculo_funcional')
  ) as v(slug, nome, ordem, codigo)
  join public.ofertas o on o.slug = v.slug
  on conflict (escola_id, nome) do nothing;
end;
$$;

revoke all on function public.provisionar_escola_referencia(uuid) from public, anon, authenticated;

create or replace function public.trg_escolas_dados_iniciais()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.provisionar_escola_referencia(new.id);
  return new;
end;
$$;

revoke all on function public.trg_escolas_dados_iniciais() from public, anon, authenticated;

create trigger trg_escolas_dados_iniciais
  after insert on public.escolas
  for each row execute function public.trg_escolas_dados_iniciais();

-- Escola que já existe e nasceu vazia (só sem nenhum dos três).
select public.provisionar_escola_referencia(e.id)
from public.escolas e
where not exists (select 1 from public.turnos t where t.escola_id = e.id)
  and not exists (select 1 from public.anos_letivos a where a.escola_id = e.id)
  and not exists (select 1 from public.etapas_ciclos x where x.escola_id = e.id);
