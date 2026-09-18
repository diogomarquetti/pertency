-- Cadastro de Estudante — Onda 3B: Aba 5 (Condição do estudante), HU-EST-001
-- v2.0 seção 14. Duas tabelas: condições (1:N — um estudante pode ter mais
-- de uma) e perfil funcional (1:1 — Blocos 2/3, mesmo padrão de
-- dados_escolares vs. vinculos_escolares_anuais).

create table public.condicoes_estudante (
  id uuid primary key default gen_random_uuid(),
  estudante_id uuid not null references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  tipo_condicao text not null check (
    tipo_condicao in (
      'tea', 'deficiencia_intelectual', 'deficiencia_fisica', 'deficiencia_multipla',
      'deficiencia_visual', 'deficiencia_auditiva', 'outra'
    )
  ),
  documento_id uuid references public.documentos_estudante(id),
  observacoes text,
  cid text,
  created_by uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_condicoes_estudante_updated_at
  before update on public.condicoes_estudante
  for each row execute function public.set_updated_at();

-- Leitura ampla, mesmo padrão de estudantes/avaliacoes_ingresso — sem
-- restrição de perfil na policy de select.
create policy "condicoes_estudante_select_same_escola" on public.condicoes_estudante
  for select using (escola_id = public.get_escola_id());

-- Escrita restrita a administrador/coordenação pedagógica — a HU (seção 19)
-- diz explicitamente que Secretaria "não edita análise pedagógica/condição
-- sem permissão", diferente das demais tabelas do módulo.
create policy "condicoes_estudante_write_restrito" on public.condicoes_estudante
  using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (array['administrador', 'coordenacao_pedagogica']::public.user_role[])
  )
  with check (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (array['administrador', 'coordenacao_pedagogica']::public.user_role[])
  );

create table public.perfil_funcional_estudante (
  id uuid primary key default gen_random_uuid(),
  estudante_id uuid not null unique references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),

  -- Bloco 2: informações importantes para a rotina escolar
  meio_comunicacao text,
  recursos_caa text[],
  apoio_alimentacao boolean,
  apoio_higiene boolean,
  apoio_locomocao boolean,
  apoio_avd boolean,
  apoio_avd_checklist text[],
  alergias_restricoes text,
  necessita_medicacao boolean,
  medicacao_detalhes text,
  recursos_acessibilidade text[],
  outras_informacoes text,

  -- Bloco 3: alertas para a equipe
  situacoes_atencao text,
  o_que_ajuda text,
  seguranca_cuidados text,

  created_by uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_perfil_funcional_estudante_updated_at
  before update on public.perfil_funcional_estudante
  for each row execute function public.set_updated_at();

create policy "perfil_funcional_estudante_select_same_escola" on public.perfil_funcional_estudante
  for select using (escola_id = public.get_escola_id());

create policy "perfil_funcional_estudante_write_restrito" on public.perfil_funcional_estudante
  using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (array['administrador', 'coordenacao_pedagogica']::public.user_role[])
  )
  with check (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (array['administrador', 'coordenacao_pedagogica']::public.user_role[])
  );
