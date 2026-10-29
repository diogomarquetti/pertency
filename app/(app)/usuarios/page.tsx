import { PageTitle } from "@/components/layout/page-title";
import { createClient } from "@/lib/supabase/server";
import { getViewerIsAdmin, getViewerPodeAbrirCadastroUsuario } from "@/lib/supabase/get-viewer-role";

import { UsuariosLista } from "./usuarios-lista";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const [{ data: usuarios }, canEdit, podeAbrir] = await Promise.all([
    supabase
      .from("usuarios")
      .select("id, nome_completo, email, funcao, status, foto_url")
      .order("nome_completo"),
    getViewerIsAdmin(),
    getViewerPodeAbrirCadastroUsuario(),
  ]);

  return (
    <div>
      <PageTitle value="Usuários" />
      <UsuariosLista usuarios={usuarios ?? []} canEdit={canEdit} podeAbrir={podeAbrir} />
    </div>
  );
}
