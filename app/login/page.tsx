import { redirect } from "next/navigation";

import { LoginScreen } from "@/components/auth/login-screen";
import { getCurrentUser } from "@/lib/supabase/get-user";

import { login } from "./actions";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <LoginScreen descricao="Acesse com o e-mail e senha cadastrados pela sua instituição.">
      <LoginForm action={login} />
    </LoginScreen>
  );
}
