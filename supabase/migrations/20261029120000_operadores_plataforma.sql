-- Operadores da plataforma: os donos do Pertency, que usam o admin
-- (admin.pertency.com.br) para cadastrar escolas, mantenedoras e o primeiro
-- usuário administrador de cada escola.
--
-- Operador não é usuário de escola: não tem linha em `usuarios`, então
-- get_escola_id()/get_user_role() devolvem null e nenhuma política de escola
-- o alcança. O acesso dele vem só das políticas `*_operador`, via
-- is_operador(). Uma conta é operador OU usuário de escola, nunca as duas —
-- senão um administrador da escola poderia trocar o e-mail de login ou gerar
-- link de acesso para a conta do operador e entrar no admin com ela.

create table public.operadores_plataforma (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.operadores_plataforma enable row level security;

-- Sem escrita pelo client: operador é criado por script
-- (pnpm bootstrap:operador), com a service role.
revoke insert, update, delete on public.operadores_plataforma from anon, authenticated;

create or replace function public.is_operador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.operadores_plataforma
    where id = auth.uid() and ativo
  );
$$;

revoke execute on function public.is_operador() from public, anon;
grant execute on function public.is_operador() to authenticated;

create policy "operadores_select_operador" on public.operadores_plataforma
  for select using (public.is_operador());

-- ---------------------------------------------------------------------------
-- Conta de operador e conta de escola não se misturam
-- ---------------------------------------------------------------------------
create or replace function public.impedir_conta_operador_e_escola()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'operadores_plataforma'
     and exists (select 1 from public.usuarios where id = new.id) then
    raise exception 'Esta conta já é usuário de uma escola e não pode ser operador da plataforma.';
  end if;

  if tg_table_name = 'usuarios'
     and exists (select 1 from public.operadores_plataforma where id = new.id) then
    raise exception 'Esta conta é operador da plataforma e não pode ser usuário de escola.';
  end if;

  return new;
end;
$$;

create trigger trg_operadores_conta_exclusiva
  before insert on public.operadores_plataforma
  for each row execute function public.impedir_conta_operador_e_escola();

create trigger trg_usuarios_conta_exclusiva
  before insert on public.usuarios
  for each row execute function public.impedir_conta_operador_e_escola();

-- ---------------------------------------------------------------------------
-- Autoria na auditoria
-- ---------------------------------------------------------------------------
-- Os triggers de auditoria gravam `alterado_por = auth.uid()`, e essa coluna
-- tem FK para `usuarios` (usada nos históricos: usuarios!..._alterado_por_fkey).
-- Quando quem altera é um operador, o id dele não existe em `usuarios` e o
-- insert falharia. Em vez de reescrever cada trigger, este BEFORE INSERT
-- move o id para `alterado_por_operador`. Só nas tabelas que o admin altera.

create or replace function public.auditoria_autor_operador()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.alterado_por is not null
     and exists (select 1 from public.operadores_plataforma where id = new.alterado_por) then
    new.alterado_por_operador := new.alterado_por;
    new.alterado_por := null;
  end if;
  return new;
end;
$$;

alter table public.escolas_auditoria
  add column alterado_por_operador uuid references public.operadores_plataforma(id) on delete set null;
alter table public.mantenedoras_auditoria
  add column alterado_por_operador uuid references public.operadores_plataforma(id) on delete set null;
alter table public.usuarios_auditoria
  add column alterado_por_operador uuid references public.operadores_plataforma(id) on delete set null;

create trigger trg_escolas_auditoria_autor
  before insert on public.escolas_auditoria
  for each row execute function public.auditoria_autor_operador();
create trigger trg_mantenedoras_auditoria_autor
  before insert on public.mantenedoras_auditoria
  for each row execute function public.auditoria_autor_operador();
create trigger trg_usuarios_auditoria_autor
  before insert on public.usuarios_auditoria
  for each row execute function public.auditoria_autor_operador();

-- ---------------------------------------------------------------------------
-- Acesso do operador (escolas, usuários e históricos)
-- ---------------------------------------------------------------------------
-- Mantenedoras ficam na migration seguinte, junto com a inversão do vínculo.

create policy "escolas_select_operador" on public.escolas
  for select using (public.is_operador());
create policy "escolas_insert_operador" on public.escolas
  for insert with check (public.is_operador());
create policy "escolas_update_operador" on public.escolas
  for update using (public.is_operador()) with check (public.is_operador());

create policy "usuarios_select_operador" on public.usuarios
  for select using (public.is_operador());
create policy "usuarios_insert_operador" on public.usuarios
  for insert with check (public.is_operador());
create policy "usuarios_update_operador" on public.usuarios
  for update using (public.is_operador()) with check (public.is_operador());

create policy "escolas_auditoria_select_operador" on public.escolas_auditoria
  for select using (public.is_operador());
create policy "usuarios_auditoria_select_operador" on public.usuarios_auditoria
  for select using (public.is_operador());
