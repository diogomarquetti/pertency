import { PageTitle } from "@/components/layout/page-title";
import { createClient } from "@/lib/supabase/server";
import { getViewerIsAdmin } from "@/lib/supabase/get-viewer-role";

import { UsuariosLista } from "./usuarios-lista";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const [{ data: usuarios }, canEdit] = await Promise.all([
    supabase
      .from("usuarios")
      .select("id, nome_completo, email, funcao, status, foto_url")
      .order("nome_completo"),
    getViewerIsAdmin(),
  ]);

  return (
    <div>
      <PageTitle value="Usuários" />
      <UsuariosLista usuarios={usuarios ?? []} canEdit={canEdit} />
    </div>
  );
}
