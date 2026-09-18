-- Cadastro de Estudante — Fase 3 (Aba 3: Documentos).
-- docs/requisitos/cadastro-estudante.md, seção 3. Bucket privado (diferente de
-- estudantes-fotos): RG, CPF, laudo médico são documentos sensíveis.

create table public.documentos_estudante (
  id uuid primary key default gen_random_uuid(),
  estudante_id uuid not null references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  tipo text not null check (
    tipo in (
      'certidao_rg_cpf', 'comprovante_endereco', 'carteira_vacinacao', 'historico_escolar',
      'guia_transferencia', 'laudo', 'relatorio_anterior', 'outro'
    )
  ),
  nome_documento text,
  status text not null default 'pendente' check (status in ('entregue', 'pendente', 'nao_se_aplica')),
  arquivo_path text,
  arquivo_nome text,
  data_envio date,
  conferido_por uuid references public.usuarios(id),
  created_by uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- No máximo uma linha por tipo fixo por estudante (upsert-safe); "outro" pode
-- se repetir (regra 7: "permitir adicionar documento extra").
create unique index documentos_estudante_tipo_unico
  on public.documentos_estudante (estudante_id, tipo)
  where tipo <> 'outro';

create trigger trg_documentos_estudante_updated_at
  before update on public.documentos_estudante
  for each row execute function public.set_updated_at();

-- Mais restritivo que o padrão "qualquer autenticado lê" de estudantes/turmas
-- — conteúdo sensível, só a equipe com escrita também lê.
create policy "documentos_estudante_select_staff" on public.documentos_estudante
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

create policy "documentos_estudante_write_staff" on public.documentos_estudante
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
-- Storage — privado (sem policy de leitura pública), caminho
-- "{escola_id}/{estudante_id}/{tipo-ou-id}.{ext}".
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('estudantes-documentos', 'estudantes-documentos', false)
on conflict (id) do nothing;

create policy "estudantes_documentos_select_staff"
  on storage.objects for select
  using (
    bucket_id = 'estudantes-documentos'
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
    and (storage.foldername(name))[1] = public.get_escola_id()::text
  );

create policy "estudantes_documentos_insert_staff"
  on storage.objects for insert
  with check (
    bucket_id = 'estudantes-documentos'
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
    and (storage.foldername(name))[1] = public.get_escola_id()::text
  );

create policy "estudantes_documentos_update_staff"
  on storage.objects for update
  using (
    bucket_id = 'estudantes-documentos'
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
    and (storage.foldername(name))[1] = public.get_escola_id()::text
  );

create policy "estudantes_documentos_delete_staff"
  on storage.objects for delete
  using (
    bucket_id = 'estudantes-documentos'
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
    and (storage.foldername(name))[1] = public.get_escola_id()::text
  );
