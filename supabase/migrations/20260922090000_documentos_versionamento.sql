-- Cadastro de Estudante — Versionamento de documentos (Aba 3).
-- docs/requisitos/cadastro-estudante.md, seção 12.2 / CA20 / QA22: "Todos os
-- anexos e substituições devem preservar histórico de versão". Mesmo padrão
-- já usado em avaliacao_relatorios (Onda 3A) — tabela só-insert, imutável.
-- documentos_estudante continua sendo o "ponteiro" pro arquivo atual (é ele
-- que condicoes_estudante.documento_id referencia, e o checklist da Aba 3 lê
-- direto dele) — cada envio novo só acrescenta uma linha aqui.
create table public.documentos_estudante_versoes (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid not null references public.documentos_estudante(id) on delete cascade,
  estudante_id uuid not null references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  versao int not null,
  arquivo_path text not null,
  arquivo_nome text not null,
  enviado_por uuid references public.usuarios(id),
  enviado_em timestamptz not null default now(),
  unique (documento_id, versao)
);

-- Mesmo conjunto de perfis de documentos_estudante_write_staff — histórico
-- carrega o mesmo tipo de conteúdo sensível (RG, CPF, laudo médico) da
-- tabela principal, então a leitura fica restrita à equipe, não "qualquer
-- autenticado da escola" como em avaliacao_relatorios. Sem update/delete:
-- cada envio é um registro novo e imutável (delete em cascata a partir de
-- documentos_estudante continua funcionando, RLS de delete não é necessária
-- pra isso).
create policy "documentos_estudante_versoes_select_staff" on public.documentos_estudante_versoes
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

create policy "documentos_estudante_versoes_insert_staff" on public.documentos_estudante_versoes
  for insert with check (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );
