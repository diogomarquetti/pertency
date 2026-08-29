import { redirect } from "next/navigation";

import { LogoHorizontal } from "@/components/brand/logo-horizontal";
import { getCurrentUser } from "@/lib/supabase/get-user";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-1 bg-bg">
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <div>
            <h1 className="sr-only">Entrar</h1>
            <LogoHorizontal className="h-9 w-auto" />
            <p className="mt-3 text-sm text-muted">
              Acesse com o e-mail e senha cadastrados pela sua instituição.
            </p>
          </div>

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="hidden flex-1 p-6 lg:flex">
        <div className="relative flex w-full flex-col justify-end gap-[14px] overflow-hidden rounded-xl bg-navy px-12 py-10 text-white">
          <video
            className="absolute inset-0 size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            src="/brand/login-banner.mp4"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,14,56,0.55)_0%,rgba(0,14,56,0.35)_45%,rgba(0,14,56,0.78)_100%)]" />

          <div className="relative max-w-sm">
            <h2 className="text-subtitle text-white">
              Pertencimento começa com organização.
            </h2>
            <p className="mt-3 text-body text-white">
              A plataforma de gestão pedagógica feita para escolas
              especializadas.
            </p>
          </div>

          <span className="relative text-caption text-white/45">
            © {new Date().getFullYear()} Pertency
          </span>
        </div>
      </div>
    </div>
  );
}
