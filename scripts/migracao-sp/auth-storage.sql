-- Migração para São Paulo (ver docs/migracao-sp.md) — o que o dump do banco NÃO leva.
--
-- `supabase db dump` não exporta objetos criados nos schemas gerenciados
-- `auth` e `storage`: as policies de storage.objects e o trigger de auditoria
-- de troca de e-mail em auth.users. Este arquivo recria os dois no projeto
-- novo, depois do restore. É cópia literal das migrations (indicadas acima de
-- cada bloco) — não editar aqui; se uma migration mudar, gerar de novo.
--
-- Conferência no projeto ATUAL, antes da virada (deve dar 15 e 1):
--   select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects';
--   select count(*) from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
-- Se der diferente, alguém criou algo direto no painel: incluir aqui antes de seguir.

begin;

-- 20260826183829_remote_schema.sql
CREATE TRIGGER trg_auth_users_email_audit AFTER UPDATE OF email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.audit_auth_email_change();

-- 20260826193900_usuarios_fotos_bucket.sql
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

-- 20260828112518_usuarios_self_service.sql
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

-- 20260916151628_estudantes.sql
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

-- 20260916161210_documentos_estudante.sql
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

commit;
