import { PageTitle } from "@/components/layout/page-title";
import { createClient } from "@/lib/supabase/server";

import { UsuariosLista } from "./usuarios-lista";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, nome_completo, email, funcao, status, foto_url")
    .order("nome_completo");

  return (
    <div>
      <PageTitle value="Usuários" />
      <UsuariosLista usuarios={usuarios ?? []} />
    </div>
  );
}
