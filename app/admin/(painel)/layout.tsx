import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { SemAcessoAdmin } from "@/components/admin/sem-acesso-admin";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { getOperadorAtual } from "@/lib/supabase/get-operador";

export default async function PainelAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Sessão válida, mas não de operador (ex.: link de acesso de um usuário de
  // escola aberto no domínio do admin). Não dá para sair daqui no render —
  // a tela oferece o botão Sair.
  const operador = await getOperadorAtual();
  if (!operador) {
    return <SemAcessoAdmin email={user.email ?? ""} />;
  }

  return (
    <AppShell
      area="plataforma"
      userName={operador.nome}
      userEmail={operador.email}
      escolaNome={null}
      notificacoes={null}
    >
      {children}
    </AppShell>
  );
}
