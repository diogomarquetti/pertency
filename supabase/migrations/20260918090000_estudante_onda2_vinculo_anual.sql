-- Cadastro de Estudante — Onda 2: vínculo escolar anual (HU-EST-001 v2.0,
-- seção 18.1). Oferta atual, organização atual, turno, turma, matrícula
-- interna, transporte e data de matrícula efetiva passam a pertencer ao
-- vínculo de um ano letivo específico — trocar de ano não pode mais
-- sobrescrever o vínculo do ano anterior (CA25). Isso separa
-- `dados_escolares` (fatos únicos da trajetória: ingresso, origem escolar,
-- encerramento — não repetem por ano) de uma nova tabela
-- `vinculos_escolares_anuais`, 1:N por (estudante, ano letivo).

create table public.vinculos_escolares_anuais (
  id uuid primary key default gen_random_uuid(),
  estudante_id uuid not null references public.estudantes(id) on delete cascade,
  ano_letivo_id uuid not null references public.anos_letivos(id),
  escola_id uuid not null references public.escolas(id),

  oferta_atual_id uuid references public.ofertas(id),
  organizacao_atual_id uuid references public.etapas_ciclos(id),
  etapa_do_ciclo text,
  turno_id uuid references public.turnos(id),
  turma_id uuid references public.turmas(id),
  matricula_interna text,
  utiliza_transporte boolean,
  data_matricula_efetiva date,

  created_by uuid references public.usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (estudante_id, ano_letivo_id)
);

create trigger trg_vinculos_escolares_anuais_updated_at
  before update on public.vinculos_escolares_anuais
  for each row execute function public.set_updated_at();

create policy "vinculos_escolares_anuais_select_staff" on public.vinculos_escolares_anuais
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

create policy "vinculos_escolares_anuais_write_staff" on public.vinculos_escolares_anuais
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
-- Auditoria — assume a cobertura que antes vivia em dados_escolares_auditoria
-- (oferta, turma, matrícula), já que esses campos saem de lá.
-- ---------------------------------------------------------------------------
create table public.vinculos_escolares_anuais_auditoria (
  id uuid primary key default gen_random_uuid(),
  vinculo_id uuid not null references public.vinculos_escolares_anuais(id) on delete cascade,
  escola_id uuid not null references public.escolas(id),
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  alterado_por uuid references public.usuarios(id),
  alterado_em timestamptz not null default now()
);

create policy "vinculos_escolares_anuais_auditoria_select_staff" on public.vinculos_escolares_anuais_auditoria
  for select using (
    escola_id = public.get_escola_id()
    and public.get_user_role() = any (
      array['administrador', 'secretaria', 'coordenacao_pedagogica']::public.user_role[]
    )
  );

create or replace function public.audit_vinculos_escolares_anuais_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.oferta_atual_id is distinct from old.oferta_atual_id then
    insert into public.vinculos_escolares_anuais_auditoria (vinculo_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'oferta_atual_id', old.oferta_atual_id::text, new.oferta_atual_id::text, auth.uid());
  end if;

  if new.turma_id is distinct from old.turma_id then
    insert into public.vinculos_escolares_anuais_auditoria (vinculo_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'turma_id', old.turma_id::text, new.turma_id::text, auth.uid());
  end if;

  if new.matricula_interna is distinct from old.matricula_interna then
    insert into public.vinculos_escolares_anuais_auditoria (vinculo_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'matricula_interna', old.matricula_interna, new.matricula_interna, auth.uid());
  end if;

  return new;
end;
$$;

create trigger trg_vinculos_escolares_anuais_audit
  after update on public.vinculos_escolares_anuais
  for each row execute function public.audit_vinculos_escolares_anuais_changes();

-- ---------------------------------------------------------------------------
-- Migra os vínculos já existentes em dados_escolares — hoje só existe um
-- ano letivo por escola (status 'ativo'), então é seguro assumir esse como
-- o ano do vínculo já cadastrado.
-- ---------------------------------------------------------------------------
insert into public.vinculos_escolares_anuais (
  estudante_id, ano_letivo_id, escola_id, oferta_atual_id, organizacao_atual_id,
  etapa_do_ciclo, turno_id, turma_id, matricula_interna, utiliza_transporte,
  data_matricula_efetiva, created_by, created_at, updated_at
)
select
  de.estudante_id, al.id, de.escola_id, de.oferta_atual_id, de.organizacao_atual_id,
  de.etapa_do_ciclo, de.turno_id, de.turma_id, de.matricula_interna, de.utiliza_transporte,
  de.data_matricula_efetiva, de.created_by, de.created_at, de.updated_at
from public.dados_escolares de
join public.anos_letivos al on al.escola_id = de.escola_id and al.status = 'ativo';

-- O trigger antigo cobria justamente os campos que estão saindo daqui —
-- a auditoria deles passa a viver em trg_vinculos_escolares_anuais_audit.
-- Os registros já gravados em dados_escolares_auditoria não são apagados
-- (valor histórico).
drop trigger trg_dados_escolares_audit on public.dados_escolares;
drop function public.audit_dados_escolares_changes();

alter table public.dados_escolares
  drop column oferta_atual_id,
  drop column organizacao_atual_id,
  drop column etapa_do_ciclo,
  drop column turno_id,
  drop column turma_id,
  drop column matricula_interna,
  drop column utiliza_transporte,
  drop column data_matricula_efetiva;
