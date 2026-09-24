"use client";

import { useState, useTransition } from "react";
import { Camera, Trash2, User as UserIcon } from "lucide-react";

import { getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileUpload } from "@/components/ui/file-upload";

type FotoAlvo = {
  /** Bucket público de leitura; caminho `{escolaId}/{registroId}.{ext}`. */
  bucket: "estudantes-fotos" | "usuarios-fotos";
  /** Tabela cuja coluna `foto_url` aponta pra foto atual. */
  tabela: "estudantes" | "usuarios";
  registroId: string;
  escolaId: string;
  fotoUrlInicial: string | null;
};

/**
 * Upload/remoção de foto direto do client — sobe pro bucket e atualiza
 * `foto_url` na tabela, sem passar pelo formulário (trocar de foto nunca
 * depende do resto do cadastro ser salvo). Antes de cada upload remove
 * qualquer arquivo anterior do mesmo registro (evita órfão ao trocar
 * PNG ↔ JPG). Usado pelos cards de topo de Estudante e Usuário.
 */
export function useFotoEditavel(alvo: FotoAlvo | undefined) {
  const [fotoUrl, setFotoUrl] = useState(alvo?.fotoUrlInicial ?? null);
  const [isPending, startTransition] = useTransition();

  async function removeArquivosExistentes(supabase: ReturnType<typeof createClient>, alvo: FotoAlvo) {
    const { data: existentes } = await supabase.storage
      .from(alvo.bucket)
      .list(alvo.escolaId, { search: alvo.registroId });

    if (existentes && existentes.length > 0) {
      await supabase.storage
        .from(alvo.bucket)
        .remove(existentes.map((arquivo) => `${alvo.escolaId}/${arquivo.name}`));
    }
  }

  function enviar(file: File | null) {
    if (!file || !alvo) return;

    startTransition(async () => {
      const supabase = createClient();
      const extensao = file.type === "image/png" ? "png" : "jpg";
      const path = `${alvo.escolaId}/${alvo.registroId}.${extensao}`;

      await removeArquivosExistentes(supabase, alvo);

      const { error: uploadError } = await supabase.storage
        .from(alvo.bucket)
        .upload(path, file, { contentType: file.type, upsert: true });

      if (uploadError) {
        toast.error("Não foi possível enviar a foto", "Tente novamente.");
        return;
      }

      const { data } = supabase.storage.from(alvo.bucket).getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from(alvo.tabela)
        .update({ foto_url: publicUrl })
        .eq("id", alvo.registroId);

      if (updateError) {
        toast.error("Foto enviada, mas não foi salva no cadastro", "Tente novamente.");
        return;
      }

      setFotoUrl(publicUrl);
      toast.success("Foto atualizada com sucesso.");
    });
  }

  function remover() {
    if (!alvo) return;

    startTransition(async () => {
      const supabase = createClient();
      await removeArquivosExistentes(supabase, alvo);

      const { error: updateError } = await supabase
        .from(alvo.tabela)
        .update({ foto_url: null })
        .eq("id", alvo.registroId);

      if (updateError) {
        toast.error("Não foi possível remover a foto", "Tente novamente.");
        return;
      }

      setFotoUrl(null);
      toast.success("Foto removida com sucesso.");
    });
  }

  return { fotoUrl, isPending, enviar, remover };
}

/**
 * Avatar do card de topo: clicável (overlay de câmera, mesmo padrão da Minha
 * Conta) quando `editavel`, estático caso contrário.
 */
export function AvatarFotoEditavel({
  nome,
  fotoUrl,
  editavel,
  isPending,
  onFile,
}: {
  nome: string;
  fotoUrl: string | null;
  editavel: boolean;
  isPending: boolean;
  onFile: (file: File | null) => void;
}) {
  const avatar = (
    <Avatar size="lg" clickable={editavel} className={editavel ? "size-full" : undefined}>
      {fotoUrl && <AvatarImage src={fotoUrl} alt={nome} />}
      <AvatarFallback>
        {nome ? getInitials(nome) : <UserIcon size={20} strokeWidth={2} aria-hidden="true" />}
      </AvatarFallback>
    </Avatar>
  );

  if (!editavel) return avatar;

  return (
    <FileUpload
      onFileSelected={onFile}
      onError={(message) => toast.error(message)}
      disabled={isPending}
      className="group relative size-[var(--space-6)] shrink-0 rounded-full border-none bg-transparent p-0 hover:bg-transparent"
    >
      {avatar}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-ink/50 opacity-0 transition-opacity duration-fast ease-standard group-hover:opacity-100">
        <Camera size={18} strokeWidth={2} className="text-white" aria-hidden="true" />
      </div>
    </FileUpload>
  );
}

export function RemoverFotoButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ml-2 flex items-center gap-[4px] text-[12.5px] text-muted transition-colors duration-fast ease-standard hover:text-danger disabled:pointer-events-none disabled:opacity-50"
    >
      <Trash2 size={12} strokeWidth={2} aria-hidden="true" />
      Remover foto
    </button>
  );
}
