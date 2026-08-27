
  create table "public"."mantenedoras" (
    "id" uuid not null default gen_random_uuid(),
    "escola_id" uuid not null,
    "razao_social" text not null,
    "nome_fantasia" text not null,
    "cnpj" text not null,
    "logradouro" text not null,
    "numero" text not null,
    "complemento" text,
    "bairro" text not null,
    "cep" text not null,
    "municipio" text not null,
    "uf" text not null,
    "fone_institucional" text not null,
    "whatsapp_institucional" text,
    "email_institucional" text not null,
    "site" text,
    "presidente_nome" text not null,
    "presidente_cpf" text not null,
    "presidente_fone" text not null,
    "presidente_email" text not null,
    "status" text not null default 'ativa'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."mantenedoras" enable row level security;


  create table "public"."mantenedoras_auditoria" (
    "id" uuid not null default gen_random_uuid(),
    "mantenedora_id" uuid not null,
    "campo_alterado" text not null,
    "valor_anterior" text,
    "valor_novo" text,
    "alterado_por" uuid,
    "alterado_em" timestamp with time zone not null default now()
      );


alter table "public"."mantenedoras_auditoria" enable row level security;

alter table "public"."escolas" add column "bairro" text;

alter table "public"."escolas" add column "cep" text;

alter table "public"."escolas" add column "codigo_escola" text;

alter table "public"."escolas" add column "complemento" text;

alter table "public"."escolas" add column "coordenador_email" text;

alter table "public"."escolas" add column "coordenador_fone" text;

alter table "public"."escolas" add column "coordenador_nome" text;

alter table "public"."escolas" add column "diretor_email" text;

alter table "public"."escolas" add column "diretor_fone" text;

alter table "public"."escolas" add column "diretor_nome" text;

alter table "public"."escolas" add column "email_institucional" text;

alter table "public"."escolas" add column "fone_institucional" text;

alter table "public"."escolas" add column "logradouro" text;

alter table "public"."escolas" add column "modalidade" text not null default 'Educação Especial'::text;

alter table "public"."escolas" add column "municipio" text;

alter table "public"."escolas" add column "nome_usual" text;

alter table "public"."escolas" add column "nre_referencia" text;

alter table "public"."escolas" add column "numero" text;

alter table "public"."escolas" add column "tipo_escola" text not null default 'Escola de Educação Básica, Modalidade Educação Especial'::text;

alter table "public"."escolas" add column "uf" text;

alter table "public"."escolas" add column "updated_at" timestamp with time zone not null default now();

CREATE INDEX idx_mantenedoras_auditoria_mantenedora ON public.mantenedoras_auditoria USING btree (mantenedora_id);

CREATE UNIQUE INDEX mantenedoras_auditoria_pkey ON public.mantenedoras_auditoria USING btree (id);

CREATE UNIQUE INDEX mantenedoras_escola_id_key ON public.mantenedoras USING btree (escola_id);

CREATE UNIQUE INDEX mantenedoras_pkey ON public.mantenedoras USING btree (id);

alter table "public"."mantenedoras" add constraint "mantenedoras_pkey" PRIMARY KEY using index "mantenedoras_pkey";

alter table "public"."mantenedoras_auditoria" add constraint "mantenedoras_auditoria_pkey" PRIMARY KEY using index "mantenedoras_auditoria_pkey";

alter table "public"."escolas" add constraint "escolas_cep_formato" CHECK (((cep IS NULL) OR (cep ~ '^\d{5}-\d{3}$'::text))) not valid;

alter table "public"."escolas" validate constraint "escolas_cep_formato";

alter table "public"."escolas" add constraint "escolas_coordenador_email_formato" CHECK (((coordenador_email IS NULL) OR (coordenador_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text))) not valid;

alter table "public"."escolas" validate constraint "escolas_coordenador_email_formato";

alter table "public"."escolas" add constraint "escolas_diretor_email_formato" CHECK (((diretor_email IS NULL) OR (diretor_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text))) not valid;

alter table "public"."escolas" validate constraint "escolas_diretor_email_formato";

alter table "public"."escolas" add constraint "escolas_email_institucional_formato" CHECK (((email_institucional IS NULL) OR (email_institucional ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text))) not valid;

alter table "public"."escolas" validate constraint "escolas_email_institucional_formato";

alter table "public"."escolas" add constraint "escolas_uf_formato" CHECK (((uf IS NULL) OR (char_length(uf) = 2))) not valid;

alter table "public"."escolas" validate constraint "escolas_uf_formato";

alter table "public"."mantenedoras" add constraint "mantenedoras_cep_check" CHECK ((cep ~ '^\d{5}-\d{3}$'::text)) not valid;

alter table "public"."mantenedoras" validate constraint "mantenedoras_cep_check";

alter table "public"."mantenedoras" add constraint "mantenedoras_cnpj_check" CHECK ((cnpj ~ '^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$'::text)) not valid;

alter table "public"."mantenedoras" validate constraint "mantenedoras_cnpj_check";

alter table "public"."mantenedoras" add constraint "mantenedoras_email_institucional_check" CHECK ((email_institucional ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text)) not valid;

alter table "public"."mantenedoras" validate constraint "mantenedoras_email_institucional_check";

alter table "public"."mantenedoras" add constraint "mantenedoras_escola_id_fkey" FOREIGN KEY (escola_id) REFERENCES public.escolas(id) ON DELETE CASCADE not valid;

alter table "public"."mantenedoras" validate constraint "mantenedoras_escola_id_fkey";

alter table "public"."mantenedoras" add constraint "mantenedoras_escola_id_key" UNIQUE using index "mantenedoras_escola_id_key";

alter table "public"."mantenedoras" add constraint "mantenedoras_presidente_cpf_check" CHECK ((presidente_cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'::text)) not valid;

alter table "public"."mantenedoras" validate constraint "mantenedoras_presidente_cpf_check";

alter table "public"."mantenedoras" add constraint "mantenedoras_presidente_email_check" CHECK ((presidente_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text)) not valid;

alter table "public"."mantenedoras" validate constraint "mantenedoras_presidente_email_check";

alter table "public"."mantenedoras" add constraint "mantenedoras_status_check" CHECK ((status = ANY (ARRAY['ativa'::text, 'inativa'::text]))) not valid;

alter table "public"."mantenedoras" validate constraint "mantenedoras_status_check";

alter table "public"."mantenedoras" add constraint "mantenedoras_uf_check" CHECK ((char_length(uf) = 2)) not valid;

alter table "public"."mantenedoras" validate constraint "mantenedoras_uf_check";

alter table "public"."mantenedoras_auditoria" add constraint "mantenedoras_auditoria_alterado_por_fkey" FOREIGN KEY (alterado_por) REFERENCES public.usuarios(id) not valid;

alter table "public"."mantenedoras_auditoria" validate constraint "mantenedoras_auditoria_alterado_por_fkey";

alter table "public"."mantenedoras_auditoria" add constraint "mantenedoras_auditoria_mantenedora_id_fkey" FOREIGN KEY (mantenedora_id) REFERENCES public.mantenedoras(id) ON DELETE CASCADE not valid;

alter table "public"."mantenedoras_auditoria" validate constraint "mantenedoras_auditoria_mantenedora_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.audit_mantenedoras_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.razao_social is distinct from old.razao_social then
    insert into public.mantenedoras_auditoria (mantenedora_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'razao_social', old.razao_social, new.razao_social, auth.uid());
  end if;

  if new.cnpj is distinct from old.cnpj then
    insert into public.mantenedoras_auditoria (mantenedora_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'cnpj', old.cnpj, new.cnpj, auth.uid());
  end if;

  if new.status is distinct from old.status then
    insert into public.mantenedoras_auditoria (mantenedora_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'status', old.status, new.status, auth.uid());
  end if;

  if new.presidente_nome is distinct from old.presidente_nome then
    insert into public.mantenedoras_auditoria (mantenedora_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'representante_legal', old.presidente_nome, new.presidente_nome, auth.uid());
  end if;

  if new.email_institucional is distinct from old.email_institucional then
    insert into public.mantenedoras_auditoria (mantenedora_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, 'email_institucional', old.email_institucional, new.email_institucional, auth.uid());
  end if;

  if (new.logradouro, new.numero, new.complemento, new.bairro, new.cep, new.municipio, new.uf)
     is distinct from
     (old.logradouro, old.numero, old.complemento, old.bairro, old.cep, old.municipio, old.uf) then
    insert into public.mantenedoras_auditoria (mantenedora_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (
      new.id, 'endereco',
      concat_ws(', ', old.logradouro, old.numero, old.bairro, old.municipio, old.uf, old.cep),
      concat_ws(', ', new.logradouro, new.numero, new.bairro, new.municipio, new.uf, new.cep),
      auth.uid()
    );
  end if;

  return new;
end;
$function$
;

grant delete on table "public"."mantenedoras" to "anon";

grant insert on table "public"."mantenedoras" to "anon";

grant references on table "public"."mantenedoras" to "anon";

grant select on table "public"."mantenedoras" to "anon";

grant trigger on table "public"."mantenedoras" to "anon";

grant truncate on table "public"."mantenedoras" to "anon";

grant update on table "public"."mantenedoras" to "anon";

grant delete on table "public"."mantenedoras" to "authenticated";

grant insert on table "public"."mantenedoras" to "authenticated";

grant references on table "public"."mantenedoras" to "authenticated";

grant select on table "public"."mantenedoras" to "authenticated";

grant trigger on table "public"."mantenedoras" to "authenticated";

grant truncate on table "public"."mantenedoras" to "authenticated";

grant update on table "public"."mantenedoras" to "authenticated";

grant delete on table "public"."mantenedoras" to "service_role";

grant insert on table "public"."mantenedoras" to "service_role";

grant references on table "public"."mantenedoras" to "service_role";

grant select on table "public"."mantenedoras" to "service_role";

grant trigger on table "public"."mantenedoras" to "service_role";

grant truncate on table "public"."mantenedoras" to "service_role";

grant update on table "public"."mantenedoras" to "service_role";

grant delete on table "public"."mantenedoras_auditoria" to "anon";

grant insert on table "public"."mantenedoras_auditoria" to "anon";

grant references on table "public"."mantenedoras_auditoria" to "anon";

grant select on table "public"."mantenedoras_auditoria" to "anon";

grant trigger on table "public"."mantenedoras_auditoria" to "anon";

grant truncate on table "public"."mantenedoras_auditoria" to "anon";

grant update on table "public"."mantenedoras_auditoria" to "anon";

grant delete on table "public"."mantenedoras_auditoria" to "authenticated";

grant insert on table "public"."mantenedoras_auditoria" to "authenticated";

grant references on table "public"."mantenedoras_auditoria" to "authenticated";

grant select on table "public"."mantenedoras_auditoria" to "authenticated";

grant trigger on table "public"."mantenedoras_auditoria" to "authenticated";

grant truncate on table "public"."mantenedoras_auditoria" to "authenticated";

grant update on table "public"."mantenedoras_auditoria" to "authenticated";

grant delete on table "public"."mantenedoras_auditoria" to "service_role";

grant insert on table "public"."mantenedoras_auditoria" to "service_role";

grant references on table "public"."mantenedoras_auditoria" to "service_role";

grant select on table "public"."mantenedoras_auditoria" to "service_role";

grant trigger on table "public"."mantenedoras_auditoria" to "service_role";

grant truncate on table "public"."mantenedoras_auditoria" to "service_role";

grant update on table "public"."mantenedoras_auditoria" to "service_role";


  create policy "escolas_update_admin"
  on "public"."escolas"
  as permissive
  for update
  to public
using (((id = public.get_escola_id()) AND (public.get_user_role() = 'administrador'::public.user_role)))
with check (((id = public.get_escola_id()) AND (public.get_user_role() = 'administrador'::public.user_role)));



  create policy "mantenedoras_insert_admin"
  on "public"."mantenedoras"
  as permissive
  for insert
  to public
with check (((escola_id = public.get_escola_id()) AND (public.get_user_role() = 'administrador'::public.user_role)));



  create policy "mantenedoras_select_same_escola"
  on "public"."mantenedoras"
  as permissive
  for select
  to public
using ((escola_id = public.get_escola_id()));



  create policy "mantenedoras_update_admin"
  on "public"."mantenedoras"
  as permissive
  for update
  to public
using (((escola_id = public.get_escola_id()) AND (public.get_user_role() = 'administrador'::public.user_role)))
with check (((escola_id = public.get_escola_id()) AND (public.get_user_role() = 'administrador'::public.user_role)));



  create policy "mantenedoras_auditoria_select_admin"
  on "public"."mantenedoras_auditoria"
  as permissive
  for select
  to public
using (((EXISTS ( SELECT 1
   FROM public.mantenedoras m
  WHERE ((m.id = mantenedoras_auditoria.mantenedora_id) AND (m.escola_id = public.get_escola_id())))) AND (public.get_user_role() = 'administrador'::public.user_role)));


CREATE TRIGGER trg_escolas_updated_at BEFORE UPDATE ON public.escolas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_mantenedoras_audit AFTER UPDATE ON public.mantenedoras FOR EACH ROW EXECUTE FUNCTION public.audit_mantenedoras_changes();

CREATE TRIGGER trg_mantenedoras_updated_at BEFORE UPDATE ON public.mantenedoras FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


