import { redirect } from "next/navigation";

import { LoginScreen } from "@/components/auth/login-screen";
import { LoginForm } from "@/app/login/login-form";
import { getCurrentUser } from "@/lib/supabase/get-user";

import { loginOperador } from "./actions";

export default async function AdminLoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <LoginScreen descricao="Admin da plataforma. Acesso restrito à equipe Pertency.">
      <LoginForm action={loginOperador} />
    </LoginScreen>
  );
}
