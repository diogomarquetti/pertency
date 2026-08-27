-- Bucket de Storage para fotos de perfil dos usuários (Bloco 4 do Cadastro
-- de Usuários). Bucket público de leitura (fotos de profissionais não são
-- dado sensível) — escrita restrita a administradores da mesma escola, via
-- convenção de caminho "{escola_id}/{usuario_id}.{ext}".

insert into storage.buckets (id, name, public)
values ('usuarios-fotos', 'usuarios-fotos', true)
on conflict (id) do nothing;

create policy "usuarios_fotos_read_public"
  on storage.objects for select
  using (bucket_id = 'usuarios-fotos');

create policy "usuarios_fotos_insert_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'usuarios-fotos'
    and public.get_user_role() = 'administrador'
    and (storage.foldername(name))[1] = public.get_escola_id()::text
  );

create policy "usuarios_fotos_update_admin"
  on storage.objects for update
  using (
    bucket_id = 'usuarios-fotos'
    and public.get_user_role() = 'administrador'
    and (storage.foldername(name))[1] = public.get_escola_id()::text
  );

create policy "usuarios_fotos_delete_admin"
  on storage.objects for delete
  using (
    bucket_id = 'usuarios-fotos'
    and public.get_user_role() = 'administrador'
    and (storage.foldername(name))[1] = public.get_escola_id()::text
  );
