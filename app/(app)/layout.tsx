import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";

import { getEscolaAtual } from "./usuarios/queries";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: perfil }, escolaNome] = await Promise.all([
    supabase.from("usuarios").select("nome_completo").eq("id", user.id).maybeSingle(),
    getEscolaAtual(),
  ]);

  return (
    <AppShell
      userName={perfil?.nome_completo ?? ""}
      userEmail={user.email ?? ""}
      escolaNome={escolaNome}
    >
      {children}
    </AppShell>
  );
}
