"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { loginSchema, type LoginValues } from "./schema";

export async function login(values: LoginValues) {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("status")
    .eq("id", signInData.user.id)
    .maybeSingle();

  if (!perfil || perfil.status !== "ativo") {
    await supabase.auth.signOut();
    return { error: "Usuário inativo. Contate o administrador." };
  }

  redirect("/");
}
