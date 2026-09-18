-- Cadastro de Estudante — Onda 3A: Contribuições complementares e Geração de
-- PDF da Avaliação de Ingresso (HU-EST-001 v2.0, seções 11.3 e 11.4).

-- ---------------------------------------------------------------------------
-- Contribuições complementares — cada profissional (Psicologia, Fono,
-- Terapia Ocupacional etc.) registra sua própria observação sobre o
-- estudante, sem alterar os campos centrais da avaliação.
-- ---------------------------------------------------------------------------
create table public.avaliacao_contribuicoes (
  id uuid primary key default gen_random_uuid(),
  avaliacao_id uuid not null references public.avaliacoes_ingresso(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  profissional_id uuid not null references public.usuarios(id),
  area_contribuicao text not null check (
    area_contribuicao in (
      'servico_social', 'psicologia', 'fonoaudiologia', 'fisioterapia', 'terapia_ocupacional',
      'pedagogia', 'arte', 'educacao_fisica', 'outro'
    )
  ),
  observacoes text not null,
  implicacoes_participacao text,
  recomendacoes_escolares text,
  created_by uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_avaliacao_contribuicoes_updated_at
  before update on public.avaliacao_contribuicoes
  for each row execute function public.set_updated_at();

-- Mesmo padrão amplo de avaliacoes_ingresso_select_same_escola — leitura por
-- qualquer autenticado da escola, sem restrição de perfil.
create policy "avaliacao_contribuicoes_select_same_escola" on public.avaliacao_contribuicoes
  for select using (escola_id = public.get_escola_id());

-- Onda 3A ainda lança contribuições por quem já acessa esta tela (mesmo
-- perfil de escrita de avaliacoes_ingresso) — "só o autor edita a própria"
-- fica como regra de UI por enquanto; RLS por profissional logado é Onda 4,
-- junto com o perfil "Profissional complementar".
create policy "avaliacao_contribuicoes_write_staff" on public.avaliacao_contribuicoes
  using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  )
  with check (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

-- ---------------------------------------------------------------------------
-- Relatórios (PDF) da Avaliação de Ingresso — cada geração cria uma nova
-- versão, nunca sobrescreve a anterior (CA16). "Desatualizado" é calculado
-- na leitura comparando `avaliacao_atualizada_em` com o `updated_at` atual
-- da avaliação, sem precisar de trigger.
-- ---------------------------------------------------------------------------
create table public.avaliacao_relatorios (
  id uuid primary key default gen_random_uuid(),
  avaliacao_id uuid not null references public.avaliacoes_ingresso(id) on delete cascade,
  estudante_id uuid not null references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  tipo text not null check (tipo in ('padrao', 'completo')),
  versao int not null,
  arquivo_path text not null,
  avaliacao_atualizada_em timestamptz not null,
  gerado_por uuid references public.usuarios(id),
  gerado_em timestamptz not null default now(),
  unique (avaliacao_id, tipo, versao)
);

create policy "avaliacao_relatorios_select_same_escola" on public.avaliacao_relatorios
  for select using (escola_id = public.get_escola_id());

-- Geração restrita a quem a história autoriza a gerar (seção 19) —
-- Secretaria só visualiza/baixa a versão final, não gera. Sem update/delete:
-- cada geração é um registro novo e imutável.
create policy "avaliacao_relatorios_insert_autorizados" on public.avaliacao_relatorios
  for insert with check (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'coordenacao_pedagogica', 'direcao']::public.user_role[]
    )
  );

-- ---------------------------------------------------------------------------
-- documentos_estudante — a linha "Avaliação de Ingresso" do checklist (Aba
-- 3) deixa de ser só texto estático e passa a existir de verdade, com um
-- status próprio pra deixar claro que não aceita upload manual (CA19 /
-- regra "Gerado pelo sistema não aceita upload manual substitutivo").
-- ---------------------------------------------------------------------------
alter table public.documentos_estudante drop constraint documentos_estudante_tipo_check;
alter table public.documentos_estudante add constraint documentos_estudante_tipo_check
  check (
    tipo in (
      'documento_identificacao', 'cpf', 'comprovante_endereco', 'carteira_vacinacao',
      'vida_escolar_anterior', 'laudo', 'relatorio_anterior', 'avaliacao_ingresso', 'outro'
    )
  );

alter table public.documentos_estudante drop constraint documentos_estudante_status_check;
alter table public.documentos_estudante add constraint documentos_estudante_status_check
  check (status in ('entregue', 'pendente', 'nao_se_aplica', 'gerado_pelo_sistema'));
