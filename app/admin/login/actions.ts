"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginValues } from "@/app/login/schema";

export async function loginOperador(values: LoginValues) {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  const { data: operador } = await supabase
    .from("operadores_plataforma")
    .select("id")
    .eq("id", signInData.user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (!operador) {
    await supabase.auth.signOut();
    return { error: "Esta conta não tem acesso ao admin." };
  }

  redirect("/");
}
