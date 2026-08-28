"use client";

import { useState, useTransition } from "react";
import { Camera, Lock, Mail, Pencil, Phone, Trash2 } from "lucide-react";

import { getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";

import { FUNCAO_OPTIONS } from "@/app/(app)/usuarios/schema";
import type { MeuPerfil } from "@/app/(app)/minha-conta/queries";

const FUNCAO_LABEL: Record<string, string> = Object.fromEntries(
  FUNCAO_OPTIONS.map((option) => [option.value, option.label]),
);

/**
 * Upload/remoção de foto self-contained aqui (mesma lógica que já existia
 * em components/usuarios/foto-card.tsx) — clicar na própria foto abre o
 * seletor de arquivo, reaproveitando FileUpload só restilizado (sem a
 * moldura tracejada padrão) pra virar um círculo com overlay de câmera.
 */
export function PerfilCard({
  perfil,
  onEditarDados,
  onRedefinirSenha,
}: {
  perfil: MeuPerfil;
  onEditarDados: () => void;
  onRedefinirSenha: () => void;
}) {
  const [fotoUrl, setFotoUrl] = useState(perfil.fotoUrl);
  const [isPending, startTransition] = useTransition();

  async function removeArquivosExistentes(supabase: ReturnType<typeof createClient>) {
    const { data: existentes } = await supabase.storage
      .from("usuarios-fotos")
      .list(perfil.escolaId, { search: perfil.id });

    if (existentes && existentes.length > 0) {
      await supabase.storage
        .from("usuarios-fotos")
        .remove(existentes.map((arquivo) => `${perfil.escolaId}/${arquivo.name}`));
    }
  }

  function handleFile(file: File | null) {
    if (!file) return;

    startTransition(async () => {
      const supabase = createClient();
      const extensao = file.type === "image/png" ? "png" : "jpg";
      const path = `${perfil.escolaId}/${perfil.id}.${extensao}`;

      await removeArquivosExistentes(supabase);

      const { error: uploadError } = await supabase.storage
        .from("usuarios-fotos")
        .upload(path, file, { contentType: file.type, upsert: true });

      if (uploadError) {
        toast.error("Não foi possível enviar a foto", "Tente novamente.");
        return;
      }

      const { data } = supabase.storage.from("usuarios-fotos").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ foto_url: publicUrl })
        .eq("id", perfil.id);

      if (updateError) {
        toast.error("Foto enviada, mas não foi salva no cadastro", "Tente novamente.");
        return;
      }

      setFotoUrl(publicUrl);
      toast.success("Foto atualizada com sucesso.");
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const supabase = createClient();
      await removeArquivosExistentes(supabase);

      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ foto_url: null })
        .eq("id", perfil.id);

      if (updateError) {
        toast.error("Não foi possível remover a foto", "Tente novamente.");
        return;
      }

      setFotoUrl(null);
      toast.success("Foto removida com sucesso.");
    });
  }

  return (
    <Card className="flex-col gap-4 p-[24px] lg:flex-row lg:flex-wrap lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <FileUpload
          onFileSelected={handleFile}
          onError={(message) => toast.error(message)}
          disabled={isPending}
          className="group relative size-[var(--space-8)] shrink-0 rounded-full border-none bg-transparent p-0 hover:bg-transparent"
        >
          <Avatar size="xl" clickable className="size-full">
            {fotoUrl && <AvatarImage src={fotoUrl} alt={perfil.nomeCompleto} />}
            <AvatarFallback>{getInitials(perfil.nomeCompleto)}</AvatarFallback>
          </Avatar>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-ink/50 opacity-0 transition-opacity duration-fast ease-standard group-hover:opacity-100">
            <Camera size={20} strokeWidth={2} className="text-white" aria-hidden="true" />
          </div>
        </FileUpload>

        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          <h2 className="truncate text-highlight text-ink">{perfil.nomeCompleto}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-muted">
            <span className="flex min-w-0 items-center gap-[6px]">
              <Mail size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{perfil.email}</span>
            </span>
            {perfil.telefone && (
              <span className="flex shrink-0 items-center gap-[6px]">
                <Phone size={14} strokeWidth={2} aria-hidden="true" />
                {perfil.telefone}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="brand">{FUNCAO_LABEL[perfil.funcao] ?? perfil.funcao}</Badge>
            {fotoUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPending}
                className="flex items-center gap-[4px] text-[12.5px] text-muted transition-colors duration-fast ease-standard hover:text-danger disabled:pointer-events-none disabled:opacity-50"
              >
                <Trash2 size={12} strokeWidth={2} aria-hidden="true" />
                Remover foto
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 lg:flex-col">
        <Button type="button" variant="secondary" size="sm" onClick={onEditarDados}>
          <Pencil size={14} strokeWidth={2} aria-hidden="true" />
          Editar dados pessoais
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onRedefinirSenha}>
          <Lock size={14} strokeWidth={2} aria-hidden="true" />
          Redefinir senha
        </Button>
      </div>
    </Card>
  );
}
