"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2, Trash2, Upload } from "lucide-react";

import { getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";

type FotoCardProps =
  | { mode: "create" }
  | {
      mode: "edit";
      usuarioId: string;
      escolaId: string;
      nomeCompleto: string;
      fotoUrlInicial: string | null;
    };

/**
 * Sobe a foto pro bucket "usuarios-fotos" e atualiza usuarios.foto_url
 * direto do client (RLS de storage.objects + a policy de update de
 * usuarios já garantem que só admin da própria escola escreve). Precisa de
 * usuarioId, então só existe na edição — na criação o usuário ainda não
 * tem id.
 */
export function FotoCard(props: FotoCardProps) {
  const [fotoUrl, setFotoUrl] = useState(props.mode === "edit" ? props.fotoUrlInicial : null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function removeArquivosExistentes(
    supabase: ReturnType<typeof createClient>,
    escolaId: string,
    usuarioId: string,
  ) {
    const { data: existentes } = await supabase.storage
      .from("usuarios-fotos")
      .list(escolaId, { search: usuarioId });

    if (existentes && existentes.length > 0) {
      await supabase.storage
        .from("usuarios-fotos")
        .remove(existentes.map((arquivo) => `${escolaId}/${arquivo.name}`));
    }
  }

  function handleFile(file: File | null) {
    if (!file || props.mode !== "edit") return;
    const { usuarioId, escolaId } = props;
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const extensao = file.type === "image/png" ? "png" : "jpg";
      const path = `${escolaId}/${usuarioId}.${extensao}`;

      await removeArquivosExistentes(supabase, escolaId, usuarioId);

      const { error: uploadError } = await supabase.storage
        .from("usuarios-fotos")
        .upload(path, file, { contentType: file.type, upsert: true });

      if (uploadError) {
        setError("Não foi possível enviar a foto. Tente novamente.");
        return;
      }

      const { data } = supabase.storage.from("usuarios-fotos").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ foto_url: publicUrl })
        .eq("id", usuarioId);

      if (updateError) {
        setError("Foto enviada, mas não foi possível salvar no cadastro. Tente novamente.");
        return;
      }

      setFotoUrl(publicUrl);
    });
  }

  function handleRemove() {
    if (props.mode !== "edit") return;
    const { usuarioId, escolaId } = props;
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      await removeArquivosExistentes(supabase, escolaId, usuarioId);

      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ foto_url: null })
        .eq("id", usuarioId);

      if (updateError) {
        setError("Não foi possível remover a foto. Tente novamente.");
        return;
      }

      setFotoUrl(null);
    });
  }

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">4.</span> Foto{" "}
        <span className="text-[12.5px] font-medium text-muted">(opcional)</span>
      </h2>

      {props.mode === "create" ? (
        <p className="text-[13px] text-muted">
          Salve o cadastro primeiro para adicionar uma foto.
        </p>
      ) : (
        <>
          {fotoUrl && (
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarImage src={fotoUrl} alt={props.nomeCompleto} />
                <AvatarFallback>{getInitials(props.nomeCompleto)}</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isPending}
              >
                <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                Remover foto
              </Button>
            </div>
          )}

          <FileUpload onFileSelected={handleFile} onError={setError} disabled={isPending}>
            <Upload size={26} strokeWidth={2} className="text-muted" aria-hidden="true" />
            <p className="text-caption text-muted">JPG ou PNG, até 5MB</p>
            <Button type="button" variant="secondary" size="sm">
              {fotoUrl ? "Trocar foto" : "Adicionar foto"}
            </Button>
          </FileUpload>

          {isPending && (
            <p className="flex items-center gap-[5px] text-[12.5px] text-muted">
              <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden="true" />
              Enviando...
            </p>
          )}

          {error && (
            <p className="flex items-center gap-[5px] text-[12.5px] text-danger" role="alert">
              <AlertCircle size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </>
      )}
    </Card>
  );
}
