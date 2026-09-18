-- Cadastro de Estudante — Fase 1 (Aba 1: Dados pessoais).
-- docs/requisitos/cadastro-estudante.md — Blocos "Identificação", "Endereço" e
-- "Responsáveis e contatos" da Aba 1. Primeiro código do módulo: não existe
-- nenhuma tabela de estudantes ainda.

create table public.estudantes (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas(id),

  -- Identificação
  nome_completo text not null,
  nome_social text,
  situacao text not null default 'em_analise_de_ingresso' check (
    situacao in (
      'em_analise_de_ingresso', 'ativo', 'nao_elegivel', 'transferido', 'desligado', 'inativo'
    )
  ),
  data_nascimento date not null,
  sexo text,
  cor_raca text,
  nacionalidade text,
  naturalidade text,
  cpf text,
  rg text,
  certidao_nascimento text,
  foto_url text,

  -- Endereço
  endereco_logradouro text,
  endereco_numero text,
  endereco_complemento text,
  endereco_bairro text,
  endereco_cep text,
  endereco_municipio text,
  endereco_uf text,

  -- Responsáveis e contatos
  responsavel_principal_nome text,
  responsavel_principal_parentesco text,
  responsavel_principal_telefone text,
  segundo_responsavel_nome text,
  segundo_responsavel_parentesco text,
  segundo_responsavel_telefone text,
  filiacao text,
  quem_pode_retirar text,
  contato_emergencia text,

  created_by uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reaproveita a função já usada por trg_usuarios_updated_at.
create trigger trg_estudantes_updated_at
  before update on public.estudantes
  for each row execute function public.set_updated_at();

-- Leitura: qualquer autenticado da mesma escola (mesmo padrão simples de turmas).
create policy "estudantes_select_same_escola" on public.estudantes
  for select using (escola_id = public.get_escola_id());

-- Escrita: Administrador, Secretaria ou Coordenação Pedagógica — os perfis que a
-- história aponta como responsáveis pelas Abas 1 e 2. Revisar quando a Aba de
-- Condição do estudante (visibilidade mais restrita) for implementada.
create policy "estudantes_write_staff" on public.estudantes
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
-- Auditoria — mesmo padrão de escolas_auditoria. Cobre "situacao" agora (é o
-- campo que a história pede explicitamente: "Alteração de situação deve gerar
-- histórico"); outros campos entram conforme as próximas abas passarem a
-- alterá-los.
-- ---------------------------------------------------------------------------
create table public.estudantes_auditoria (
  id uuid primary key default gen_random_uuid(),
  estudante_id uuid not null references public.estudantes(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  alterado_por uuid references public.usuarios(id),
  alterado_em timestamptz not null default now()
);

create policy "estudantes_auditoria_select_staff" on public.estudantes_auditoria
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

create or replace function public.audit_estudantes_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.situacao is distinct from old.situacao then
    insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'situacao', old.situacao, new.situacao, auth.uid());
  end if;

  return new;
end;
$$;

create trigger trg_estudantes_audit
  after update on public.estudantes
  for each row execute function public.audit_estudantes_changes();

-- ---------------------------------------------------------------------------
-- Storage — foto do estudante (Bloco 1, opcional), mesmo padrão de
-- usuarios-fotos: bucket público de leitura, escrita restrita à equipe da
-- própria escola, caminho "{escola_id}/{estudante_id}.{ext}".
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('estudantes-fotos', 'estudantes-fotos', true)
on conflict (id) do nothing;

create policy "estudantes_fotos_read_public"
  on storage.objects for select
  using (bucket_id = 'estudantes-fotos');

create policy "estudantes_fotos_insert_staff"
  on storage.objects for insert
  with check (
    bucket_id = 'estudantes-fotos'
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
    and (storage.foldername(name))[1] = public.get_escola_id()::text
  );

create policy "estudantes_fotos_update_staff"
  on storage.objects for update
  using (
    bucket_id = 'estudantes-fotos'
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
    and (storage.foldername(name))[1] = public.get_escola_id()::text
  );

create policy "estudantes_fotos_delete_staff"
  on storage.objects for delete
  using (
    bucket_id = 'estudantes-fotos'
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
    and (storage.foldername(name))[1] = public.get_escola_id()::text
  );
