


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."user_role" AS ENUM (
    'administrador',
    'direcao',
    'secretaria',
    'coordenacao_pedagogica',
    'professor_regente',
    'professor_arte',
    'professor_educacao_fisica'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE TYPE "public"."user_status" AS ENUM (
    'ativo',
    'inativo'
);


ALTER TYPE "public"."user_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_auth_email_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if new.email is distinct from old.email then
    insert into public.usuarios_auditoria (usuario_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'email_login', old.email, new.email, auth.uid());
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."audit_auth_email_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_usuario_turmas_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.usuarios_auditoria (usuario_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
  values (old.usuario_id, 'vinculo_turma_removido', old.turma_id::text, null, auth.uid());
  return old;
end;
$$;


ALTER FUNCTION "public"."audit_usuario_turmas_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_usuario_turmas_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.usuarios_auditoria (usuario_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
  values (new.usuario_id, 'vinculo_turma_adicionado', null, new.turma_id::text, auth.uid());
  return new;
end;
$$;


ALTER FUNCTION "public"."audit_usuario_turmas_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_usuarios_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if new.funcao is distinct from old.funcao then
    insert into public.usuarios_auditoria (usuario_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'funcao', old.funcao::text, new.funcao::text, auth.uid());
  end if;

  if new.status is distinct from old.status then
    insert into public.usuarios_auditoria (usuario_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'status', old.status::text, new.status::text, auth.uid());
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."audit_usuarios_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_escola_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select escola_id from public.usuarios where id = auth.uid();
$$;


ALTER FUNCTION "public"."get_escola_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "public"."user_role"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select funcao from public.usuarios where id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."componentes_curriculares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL
);


ALTER TABLE "public"."componentes_curriculares" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."escolas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome_oficial" "text" NOT NULL,
    "status" "text" DEFAULT 'ativa'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "escolas_status_check" CHECK (("status" = ANY (ARRAY['ativa'::"text", 'inativa'::"text"])))
);


ALTER TABLE "public"."escolas" OWNER TO "postgres";


COMMENT ON TABLE "public"."escolas" IS 'Stub temporário de tenancy — substituir pelo módulo Cadastro de Escola completo.';



CREATE TABLE IF NOT EXISTS "public"."etapas_ciclos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "escola_id" "uuid" NOT NULL,
    "nome" "text" NOT NULL,
    "ordem" integer
);


ALTER TABLE "public"."etapas_ciclos" OWNER TO "postgres";


COMMENT ON TABLE "public"."etapas_ciclos" IS 'Stub temporário — detalhar quando o módulo Turmas for especificado.';



CREATE TABLE IF NOT EXISTS "public"."turmas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "escola_id" "uuid" NOT NULL,
    "etapa_ciclo_id" "uuid" NOT NULL,
    "turno_id" "uuid" NOT NULL,
    "nome" "text" NOT NULL,
    "ano_letivo" integer,
    "status" "text" DEFAULT 'ativa'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "turmas_status_check" CHECK (("status" = ANY (ARRAY['ativa'::"text", 'inativa'::"text"])))
);


ALTER TABLE "public"."turmas" OWNER TO "postgres";


COMMENT ON TABLE "public"."turmas" IS 'Stub temporário — detalhar quando o módulo Turmas for especificado.';



CREATE TABLE IF NOT EXISTS "public"."turnos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "escola_id" "uuid" NOT NULL,
    "nome" "text" NOT NULL
);


ALTER TABLE "public"."turnos" OWNER TO "postgres";


COMMENT ON TABLE "public"."turnos" IS 'Stub temporário — detalhar quando o módulo Turmas for especificado.';



CREATE TABLE IF NOT EXISTS "public"."usuario_turma_componentes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_turma_id" "uuid" NOT NULL,
    "componente_id" "uuid" NOT NULL
);


ALTER TABLE "public"."usuario_turma_componentes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usuario_turmas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "turma_id" "uuid" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."usuario_turmas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usuarios" (
    "id" "uuid" NOT NULL,
    "escola_id" "uuid" NOT NULL,
    "nome_completo" "text" NOT NULL,
    "email" "text" NOT NULL,
    "telefone" "text",
    "funcao" "public"."user_role" NOT NULL,
    "status" "public"."user_status" DEFAULT 'ativo'::"public"."user_status" NOT NULL,
    "foto_url" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "usuarios_email_check" CHECK (("email" ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::"text"))
);


ALTER TABLE "public"."usuarios" OWNER TO "postgres";


COMMENT ON TABLE "public"."usuarios" IS 'Perfil funcional do usuário (Bloco 1 da tela). Login/senha ficam em auth.users.';



COMMENT ON COLUMN "public"."usuarios"."email" IS 'E-mail de contato (Dados gerais). Pode divergir do e-mail de login em auth.users.';



CREATE TABLE IF NOT EXISTS "public"."usuarios_auditoria" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "campo_alterado" "text" NOT NULL,
    "valor_anterior" "text",
    "valor_novo" "text",
    "alterado_por" "uuid",
    "alterado_em" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."usuarios_auditoria" OWNER TO "postgres";


ALTER TABLE ONLY "public"."componentes_curriculares"
    ADD CONSTRAINT "componentes_curriculares_nome_key" UNIQUE ("nome");



ALTER TABLE ONLY "public"."componentes_curriculares"
    ADD CONSTRAINT "componentes_curriculares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."escolas"
    ADD CONSTRAINT "escolas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."etapas_ciclos"
    ADD CONSTRAINT "etapas_ciclos_escola_id_nome_key" UNIQUE ("escola_id", "nome");



ALTER TABLE ONLY "public"."etapas_ciclos"
    ADD CONSTRAINT "etapas_ciclos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."turmas"
    ADD CONSTRAINT "turmas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."turnos"
    ADD CONSTRAINT "turnos_escola_id_nome_key" UNIQUE ("escola_id", "nome");



ALTER TABLE ONLY "public"."turnos"
    ADD CONSTRAINT "turnos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuario_turma_componentes"
    ADD CONSTRAINT "usuario_turma_componentes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuario_turma_componentes"
    ADD CONSTRAINT "usuario_turma_componentes_usuario_turma_id_componente_id_key" UNIQUE ("usuario_turma_id", "componente_id");



ALTER TABLE ONLY "public"."usuario_turmas"
    ADD CONSTRAINT "usuario_turmas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuario_turmas"
    ADD CONSTRAINT "usuario_turmas_usuario_id_turma_id_key" UNIQUE ("usuario_id", "turma_id");



ALTER TABLE ONLY "public"."usuarios_auditoria"
    ADD CONSTRAINT "usuarios_auditoria_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_auditoria_usuario" ON "public"."usuarios_auditoria" USING "btree" ("usuario_id");



CREATE INDEX "idx_turmas_escola" ON "public"."turmas" USING "btree" ("escola_id");



CREATE INDEX "idx_usuario_turma_componentes_ut" ON "public"."usuario_turma_componentes" USING "btree" ("usuario_turma_id");



CREATE INDEX "idx_usuario_turmas_usuario" ON "public"."usuario_turmas" USING "btree" ("usuario_id");



CREATE INDEX "idx_usuarios_escola" ON "public"."usuarios" USING "btree" ("escola_id");



CREATE INDEX "idx_usuarios_funcao" ON "public"."usuarios" USING "btree" ("funcao");



CREATE INDEX "idx_usuarios_status" ON "public"."usuarios" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "trg_usuario_turmas_audit_delete" AFTER DELETE ON "public"."usuario_turmas" FOR EACH ROW EXECUTE FUNCTION "public"."audit_usuario_turmas_delete"();



CREATE OR REPLACE TRIGGER "trg_usuario_turmas_audit_insert" AFTER INSERT ON "public"."usuario_turmas" FOR EACH ROW EXECUTE FUNCTION "public"."audit_usuario_turmas_insert"();



CREATE OR REPLACE TRIGGER "trg_usuarios_audit" AFTER UPDATE ON "public"."usuarios" FOR EACH ROW EXECUTE FUNCTION "public"."audit_usuarios_changes"();



CREATE OR REPLACE TRIGGER "trg_usuarios_updated_at" BEFORE UPDATE ON "public"."usuarios" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."etapas_ciclos"
    ADD CONSTRAINT "etapas_ciclos_escola_id_fkey" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."turmas"
    ADD CONSTRAINT "turmas_escola_id_fkey" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."turmas"
    ADD CONSTRAINT "turmas_etapa_ciclo_id_fkey" FOREIGN KEY ("etapa_ciclo_id") REFERENCES "public"."etapas_ciclos"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."turmas"
    ADD CONSTRAINT "turmas_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "public"."turnos"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."turnos"
    ADD CONSTRAINT "turnos_escola_id_fkey" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuario_turma_componentes"
    ADD CONSTRAINT "usuario_turma_componentes_componente_id_fkey" FOREIGN KEY ("componente_id") REFERENCES "public"."componentes_curriculares"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."usuario_turma_componentes"
    ADD CONSTRAINT "usuario_turma_componentes_usuario_turma_id_fkey" FOREIGN KEY ("usuario_turma_id") REFERENCES "public"."usuario_turmas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuario_turmas"
    ADD CONSTRAINT "usuario_turmas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."usuario_turmas"
    ADD CONSTRAINT "usuario_turmas_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "public"."turmas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuario_turmas"
    ADD CONSTRAINT "usuario_turmas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuarios_auditoria"
    ADD CONSTRAINT "usuarios_auditoria_alterado_por_fkey" FOREIGN KEY ("alterado_por") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."usuarios_auditoria"
    ADD CONSTRAINT "usuarios_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_escola_id_fkey" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "auditoria_select_admin" ON "public"."usuarios_auditoria" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."usuarios" "u"
  WHERE (("u"."id" = "usuarios_auditoria"."usuario_id") AND ("u"."escola_id" = "public"."get_escola_id"())))) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role")));



ALTER TABLE "public"."componentes_curriculares" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "componentes_select_all" ON "public"."componentes_curriculares" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."escolas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "escolas_select_own" ON "public"."escolas" FOR SELECT USING (("id" = "public"."get_escola_id"()));



ALTER TABLE "public"."etapas_ciclos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "etapas_select_same_escola" ON "public"."etapas_ciclos" FOR SELECT USING (("escola_id" = "public"."get_escola_id"()));



CREATE POLICY "etapas_write_admin" ON "public"."etapas_ciclos" USING ((("escola_id" = "public"."get_escola_id"()) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role"))) WITH CHECK ((("escola_id" = "public"."get_escola_id"()) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role")));



ALTER TABLE "public"."turmas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "turmas_select_same_escola" ON "public"."turmas" FOR SELECT USING (("escola_id" = "public"."get_escola_id"()));



CREATE POLICY "turmas_write_admin" ON "public"."turmas" USING ((("escola_id" = "public"."get_escola_id"()) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role"))) WITH CHECK ((("escola_id" = "public"."get_escola_id"()) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role")));



ALTER TABLE "public"."turnos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "turnos_select_same_escola" ON "public"."turnos" FOR SELECT USING (("escola_id" = "public"."get_escola_id"()));



CREATE POLICY "turnos_write_admin" ON "public"."turnos" USING ((("escola_id" = "public"."get_escola_id"()) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role"))) WITH CHECK ((("escola_id" = "public"."get_escola_id"()) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role")));



ALTER TABLE "public"."usuario_turma_componentes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "usuario_turma_componentes_select" ON "public"."usuario_turma_componentes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."usuario_turmas" "ut"
     JOIN "public"."usuarios" "u" ON (("u"."id" = "ut"."usuario_id")))
  WHERE (("ut"."id" = "usuario_turma_componentes"."usuario_turma_id") AND ("u"."escola_id" = "public"."get_escola_id"())))));



CREATE POLICY "usuario_turma_componentes_write_admin" ON "public"."usuario_turma_componentes" USING (((EXISTS ( SELECT 1
   FROM ("public"."usuario_turmas" "ut"
     JOIN "public"."usuarios" "u" ON (("u"."id" = "ut"."usuario_id")))
  WHERE (("ut"."id" = "usuario_turma_componentes"."usuario_turma_id") AND ("u"."escola_id" = "public"."get_escola_id"())))) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role"))) WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."usuario_turmas" "ut"
     JOIN "public"."usuarios" "u" ON (("u"."id" = "ut"."usuario_id")))
  WHERE (("ut"."id" = "usuario_turma_componentes"."usuario_turma_id") AND ("u"."escola_id" = "public"."get_escola_id"())))) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role")));



ALTER TABLE "public"."usuario_turmas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "usuario_turmas_select" ON "public"."usuario_turmas" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios" "u"
  WHERE (("u"."id" = "usuario_turmas"."usuario_id") AND ("u"."escola_id" = "public"."get_escola_id"())))));



CREATE POLICY "usuario_turmas_write_admin" ON "public"."usuario_turmas" USING (((EXISTS ( SELECT 1
   FROM "public"."usuarios" "u"
  WHERE (("u"."id" = "usuario_turmas"."usuario_id") AND ("u"."escola_id" = "public"."get_escola_id"())))) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role"))) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."usuarios" "u"
  WHERE (("u"."id" = "usuario_turmas"."usuario_id") AND ("u"."escola_id" = "public"."get_escola_id"())))) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role")));



ALTER TABLE "public"."usuarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usuarios_auditoria" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "usuarios_delete_admin" ON "public"."usuarios" FOR DELETE USING ((("escola_id" = "public"."get_escola_id"()) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role")));



CREATE POLICY "usuarios_insert_admin" ON "public"."usuarios" FOR INSERT WITH CHECK ((("escola_id" = "public"."get_escola_id"()) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role")));



CREATE POLICY "usuarios_select_same_escola" ON "public"."usuarios" FOR SELECT USING (("escola_id" = "public"."get_escola_id"()));



CREATE POLICY "usuarios_update_admin" ON "public"."usuarios" FOR UPDATE USING ((("escola_id" = "public"."get_escola_id"()) AND ("public"."get_user_role"() = 'administrador'::"public"."user_role")));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."audit_auth_email_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_auth_email_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_auth_email_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_usuario_turmas_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_usuario_turmas_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_usuario_turmas_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_usuario_turmas_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_usuario_turmas_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_usuario_turmas_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_usuarios_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_usuarios_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_usuarios_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_escola_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_escola_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_escola_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."componentes_curriculares" TO "anon";
GRANT ALL ON TABLE "public"."componentes_curriculares" TO "authenticated";
GRANT ALL ON TABLE "public"."componentes_curriculares" TO "service_role";



GRANT ALL ON TABLE "public"."escolas" TO "anon";
GRANT ALL ON TABLE "public"."escolas" TO "authenticated";
GRANT ALL ON TABLE "public"."escolas" TO "service_role";



GRANT ALL ON TABLE "public"."etapas_ciclos" TO "anon";
GRANT ALL ON TABLE "public"."etapas_ciclos" TO "authenticated";
GRANT ALL ON TABLE "public"."etapas_ciclos" TO "service_role";



GRANT ALL ON TABLE "public"."turmas" TO "anon";
GRANT ALL ON TABLE "public"."turmas" TO "authenticated";
GRANT ALL ON TABLE "public"."turmas" TO "service_role";



GRANT ALL ON TABLE "public"."turnos" TO "anon";
GRANT ALL ON TABLE "public"."turnos" TO "authenticated";
GRANT ALL ON TABLE "public"."turnos" TO "service_role";



GRANT ALL ON TABLE "public"."usuario_turma_componentes" TO "anon";
GRANT ALL ON TABLE "public"."usuario_turma_componentes" TO "authenticated";
GRANT ALL ON TABLE "public"."usuario_turma_componentes" TO "service_role";



GRANT ALL ON TABLE "public"."usuario_turmas" TO "anon";
GRANT ALL ON TABLE "public"."usuario_turmas" TO "authenticated";
GRANT ALL ON TABLE "public"."usuario_turmas" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios" TO "anon";
GRANT ALL ON TABLE "public"."usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios_auditoria" TO "anon";
GRANT ALL ON TABLE "public"."usuarios_auditoria" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios_auditoria" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";

CREATE TRIGGER trg_auth_users_email_audit AFTER UPDATE OF email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.audit_auth_email_change();


