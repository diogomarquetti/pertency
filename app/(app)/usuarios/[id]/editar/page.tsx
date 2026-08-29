import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/page-title";
import { UserForm } from "@/components/usuarios/user-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getViewerIsAdmin } from "@/lib/supabase/get-viewer-role";

import { getAuditoriaUsuario, getEscolaIdAtual, getReferenciaTurmas, getVinculosUsuario } from "../../queries";
import type { VinculoLocal } from "@/components/usuarios/vinculo-types";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("nome_completo, email, telefone, funcao, status, foto_url, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!usuario) {
    notFound();
  }

  // E-mail de login vive em auth.users, não em usuarios — precisa da Admin API.
  const admin = createAdminClient();
  const { data: authUser } = await admin.auth.admin.getUserById(id);

  const [referencia, vinculosExistentes, escolaId, auditoria, canEdit] = await Promise.all([
    getReferenciaTurmas(),
    getVinculosUsuario(id),
    getEscolaIdAtual(),
    getAuditoriaUsuario(id),
    getViewerIsAdmin(),
  ]);

  const vinculosIniciais: VinculoLocal[] = vinculosExistentes.map((vinculo) => ({
    turmaId: vinculo.turmaId,
    etapaCicloId: vinculo.etapaCicloId,
    turnoId: vinculo.turnoId,
    componenteIds: vinculo.componenteIds,
    etapaCicloNome:
      referencia.etapasCiclos.find((e) => e.id === vinculo.etapaCicloId)?.nome ?? "",
    turnoNome: referencia.turnos.find((t) => t.id === vinculo.turnoId)?.nome ?? "",
    turmaNome: referencia.turmas.find((t) => t.id === vinculo.turmaId)?.nome ?? "",
    componentesNomes: referencia.componentes
      .filter((c) => vinculo.componenteIds.includes(c.id))
      .map((c) => c.nome),
  }));

  return (
    <div>
      <PageTitle
        value={canEdit ? "Editar Usuário" : "Visualizar Usuário"}
        breadcrumb={[
          { label: "Usuários", href: "/usuarios" },
          { label: canEdit ? "Editar usuário" : "Visualizar usuário" },
        ]}
      />
      <UserForm
        mode="edit"
        usuarioId={id}
        escolaId={escolaId ?? ""}
        referencia={referencia}
        vinculosIniciais={vinculosIniciais}
        fotoUrlInicial={usuario.foto_url}
        auditoria={auditoria}
        canEdit={canEdit}
        defaultValues={{
          nomeCompleto: usuario.nome_completo,
          email: usuario.email,
          telefone: usuario.telefone ?? "",
          funcao: usuario.funcao,
          status: usuario.status,
          emailLogin: authUser.user?.email ?? "",
          criadoEm: usuario.created_at,
          atualizadoEm: usuario.updated_at,
        }}
      />
    </div>
  );
}
