import { LogOut } from "lucide-react";

import { LoginScreen } from "@/components/auth/login-screen";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/(app)/actions";

/** Sessão no domínio do admin que não é de um operador da plataforma. */
export function SemAcessoAdmin({ email }: { email: string }) {
  return (
    <LoginScreen descricao="Admin da plataforma. Acesso restrito à equipe Pertency.">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink">
          A conta <span className="font-semibold">{email}</span> não tem acesso ao admin.
        </p>
        <form action={logout}>
          <Button type="submit" variant="secondary" className="w-full">
            <LogOut size={16} strokeWidth={2} aria-hidden="true" />
            Sair e entrar com outra conta
          </Button>
        </form>
      </div>
    </LoginScreen>
  );
}
