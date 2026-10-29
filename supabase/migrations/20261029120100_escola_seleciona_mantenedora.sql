-- A escola passa a selecionar a mantenedora (escolas.mantenedora_id), em vez
-- de a mantenedora pertencer à escola (mantenedoras.escola_id, 1:1). Uma
-- mantenedora pode manter mais de uma escola, e quem cadastra as duas é o
-- operador da plataforma, no admin.

alter table public.escolas
  add column mantenedora_id uuid references public.mantenedoras(id) on delete restrict;

create index escolas_mantenedora_id on public.escolas (mantenedora_id);

update public.escolas e
set mantenedora_id = m.id
from public.mantenedoras m
where m.escola_id = e.id;

-- As políticas antigas dependem de mantenedoras.escola_id.
drop policy "mantenedoras_select_same_escola" on public.mantenedoras;
drop policy "mantenedoras_insert_admin" on public.mantenedoras;
drop policy "mantenedoras_update_admin" on public.mantenedoras;
drop policy "mantenedoras_auditoria_select_admin" on public.mantenedoras_auditoria;

alter table public.mantenedoras drop column escola_id;

-- A escola lê a mantenedora que selecionou.
create policy "mantenedoras_select_da_escola" on public.mantenedoras
  for select using (
    id = (select mantenedora_id from public.escolas where id = public.get_escola_id())
  );

-- Transitório: o administrador da escola ainda edita a mantenedora vinculada
-- em Configurações até o admin da plataforma estar no ar — sai junto com
-- escolas_update_admin. Criar mantenedora já é só do operador.
create policy "mantenedoras_update_admin" on public.mantenedoras
  for update
  using (
    id = (select mantenedora_id from public.escolas where id = public.get_escola_id())
    and public.get_user_role() = 'administrador'
  )
  with check (
    id = (select mantenedora_id from public.escolas where id = public.get_escola_id())
    and public.get_user_role() = 'administrador'
  );

create policy "mantenedoras_auditoria_select_admin" on public.mantenedoras_auditoria
  for select using (
    mantenedora_id = (select mantenedora_id from public.escolas where id = public.get_escola_id())
    and public.get_user_role() = 'administrador'
  );

-- escolas_update_admin ainda deixa o administrador da escola atualizar a
-- linha da escola; a troca de mantenedora fica só com o operador.
create or replace function public.mantenedora_da_escola_so_operador()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.mantenedora_id is distinct from old.mantenedora_id
     and auth.uid() is not null
     and not public.is_operador() then
    raise exception 'Só a equipe Pertency pode trocar a mantenedora da escola.';
  end if;
  return new;
end;
$$;

create trigger trg_escolas_mantenedora_so_operador
  before update of mantenedora_id on public.escolas
  for each row execute function public.mantenedora_da_escola_so_operador();

create policy "mantenedoras_select_operador" on public.mantenedoras
  for select using (public.is_operador());
create policy "mantenedoras_insert_operador" on public.mantenedoras
  for insert with check (public.is_operador());
create policy "mantenedoras_update_operador" on public.mantenedoras
  for update using (public.is_operador()) with check (public.is_operador());

create policy "mantenedoras_auditoria_select_operador" on public.mantenedoras_auditoria
  for select using (public.is_operador());
