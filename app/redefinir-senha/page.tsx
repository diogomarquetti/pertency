import { AlertCircle } from "lucide-react";

import { LogoHorizontal } from "@/components/brand/logo-horizontal";
import { createClient } from "@/lib/supabase/server";

import { RedefinirSenhaForm } from "./redefinir-senha-form";

export default async function RedefinirSenhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-full flex-1 bg-bg">
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <div>
            <h1 className="sr-only">Redefinir senha</h1>
            <LogoHorizontal className="h-9 w-auto" />
            <p className="mt-3 text-sm text-muted">
              Defina a nova senha de acesso à sua conta Pertency.
            </p>
          </div>

          <div className="mt-6">
            {user ? (
              <RedefinirSenhaForm />
            ) : (
              <div className="flex flex-col gap-[10px]">
                <p className="flex items-center gap-[8px] text-sm text-danger" role="alert">
                  <AlertCircle size={16} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                  Link inválido ou expirado.
                </p>
                <p className="text-sm text-muted">
                  Peça pro administrador da sua escola gerar um novo link de acesso.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden flex-1 p-6 lg:flex">
        <div className="flex w-full flex-col justify-between rounded-lg bg-navy px-12 py-10">
          <span className="font-logotype text-4xl leading-none text-white">
            Pertency
          </span>

          <div className="max-w-sm">
            <p className="text-subtitle text-white">
              Gestão e planejamento de estudantes nas instituições.
            </p>
            <p className="mt-3 text-body text-blue-100/80">
              Um só lugar para acompanhar o percurso pedagógico de cada
              estudante.
            </p>
          </div>

          <span className="text-caption text-blue-100/50">
            © {new Date().getFullYear()} Pertency
          </span>
        </div>
      </div>
    </div>
  );
}
