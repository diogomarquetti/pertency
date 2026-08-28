-- Minha Conta — permite que qualquer usuário autenticado edite a própria
-- linha em `usuarios` e a própria foto em storage, sem depender de um admin.
-- Ver docs/ARCHITECTURE.md para o desenho completo dessa feature.

-- 1. RLS: usuário pode atualizar a própria linha. Fica deliberadamente
-- permissiva (sem tentar restringir coluna por coluna aqui) — a restrição
-- de "não pode virar admin de si mesmo" é feita pelo trigger abaixo, não
-- por USING/WITH CHECK, pra evitar ambiguidade de timing entre uma função
-- STABLE e a linha sendo escrita no mesmo statement.
create policy "usuarios_update_own"
  on public.usuarios for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- 2. Trigger: bloqueia um usuário não-admin de mudar a própria função,
-- status ou escola através dessa nova policy (ex: chamando o client anon
-- direto, sem passar pela Server Action). get_user_role() roda num
-- trigger BEFORE ROW, então lê a linha ANTES do UPDATE — reflete o papel
-- de quem está chamando, não o que o UPDATE propõe. Um admin editando a
-- própria linha continua liberado a mudar esses campos (o fluxo existente
-- em /usuarios/[id]/editar não trata "editar a si mesmo" como caso
-- especial, e não deveríamos travar isso agora).
create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_user_role() <> 'administrador' then
    if new.funcao is distinct from old.funcao
       or new.status is distinct from old.status
       or new.escola_id is distinct from old.escola_id then
      raise exception 'Você não pode alterar função, status ou escola.';
    end if;
  end if;
  return new;
end;
$$;

-- Convive com trg_usuarios_audit (AFTER) e trg_usuarios_updated_at
-- (BEFORE) já existentes — ordem de disparo entre triggers BEFORE do
-- mesmo evento é alfabética por nome, sem conflito real entre eles aqui.
create trigger trg_usuarios_prevent_self_escalation
  before update on public.usuarios
  for each row
  execute function public.prevent_self_privilege_escalation();

-- 3. Storage: usuário pode escrever a própria foto em usuarios-fotos.
-- Path é "{escola_id}/{usuario_id}.{ext}" — UM nível de pasta só; o id do
-- usuário está no NOME do arquivo, não num segundo segmento de pasta.
-- Aditivas às policies de admin já existentes (usuarios_fotos_*_admin) —
-- múltiplas policies permissivas pro mesmo comando se combinam com OR.
create policy "usuarios_fotos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'usuarios-fotos'
    and (storage.foldername(name))[1] = public.get_escola_id()::text
    and split_part(storage.filename(name), '.', 1) = auth.uid()::text
  );

create policy "usuarios_fotos_update_own"
  on storage.objects for update
  using (
    bucket_id = 'usuarios-fotos'
    and (storage.foldername(name))[1] = public.get_escola_id()::text
    and split_part(storage.filename(name), '.', 1) = auth.uid()::text
  );

create policy "usuarios_fotos_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'usuarios-fotos'
    and (storage.foldername(name))[1] = public.get_escola_id()::text
    and split_part(storage.filename(name), '.', 1) = auth.uid()::text
  );

-- 4. Escrita deixa de ser só-admin, então vale limitar tamanho/tipo no
-- próprio bucket (antes só o FileUpload no browser validava isso).
update storage.buckets
set file_size_limit = 5242880, -- 5MB, mesmo limite de components/ui/file-upload.tsx
    allowed_mime_types = array['image/png', 'image/jpeg']
where id = 'usuarios-fotos';
