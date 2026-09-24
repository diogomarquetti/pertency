"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Camera, Trash2, User as UserIcon } from "lucide-react";

import { getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { SITUACAO_BADGE, SITUACAO_LABEL } from "@/app/(app)/estudantes/schema";

type FotoEdicao = {
  estudanteId: string;
  escolaId: string;
  fotoUrlInicial: string | null;
  canEdit: boolean;
};

/**
 * Identificação do estudante no topo do Cadastro — acompanha as abas
 * (Tabs) logo abaixo, no mesmo card. Nome/situação são passados já
 * resolvidos pelo formulário (reativos ao que está sendo digitado, não só
 * ao valor salvo) — turma atual/matrícula não fazem parte do formulário,
 * então continuam vindo dos dados carregados do servidor.
 *
 * Upload/remoção de foto fica no próprio avatar, mesmo padrão de
 * components/minha-conta/perfil-card.tsx: sobe pro bucket "estudantes-fotos"
 * e atualiza estudantes.foto_url direto do client. Só em modo edição, porque
 * precisa do estudanteId.
 *
 * `acoes` fica na extremidade direita (ex.: botão do Histórico de alterações).
 */
export function EstudanteHeroCard({
  mode,
  nomeCompleto,
  foto,
  situacao,
  turmaAtualLabel,
  matriculaInterna,
  acoes,
}: {
  mode: "create" | "edit";
  nomeCompleto: string;
  foto?: FotoEdicao;
  situacao?: string;
  turmaAtualLabel?: string | null;
  matriculaInterna?: string | null;
  acoes?: ReactNode;
}) {
  const titulo = mode === "edit" ? nomeCompleto || "—" : nomeCompleto || "Novo estudante";
  const [fotoUrl, setFotoUrl] = useState(foto?.fotoUrlInicial ?? null);
  const [isPending, startTransition] = useTransition();

  async function removeArquivosExistentes(
    supabase: ReturnType<typeof createClient>,
    { escolaId, estudanteId }: FotoEdicao,
  ) {
    const { data: existentes } = await supabase.storage
      .from("estudantes-fotos")
      .list(escolaId, { search: estudanteId });

    if (existentes && existentes.length > 0) {
      await supabase.storage
        .from("estudantes-fotos")
        .remove(existentes.map((arquivo) => `${escolaId}/${arquivo.name}`));
    }
  }

  function handleFile(file: File | null) {
    if (!file || !foto) return;
    const { estudanteId, escolaId } = foto;

    startTransition(async () => {
      const supabase = createClient();
      const extensao = file.type === "image/png" ? "png" : "jpg";
      const path = `${escolaId}/${estudanteId}.${extensao}`;

      await removeArquivosExistentes(supabase, foto);

      const { error: uploadError } = await supabase.storage
        .from("estudantes-fotos")
        .upload(path, file, { contentType: file.type, upsert: true });

      if (uploadError) {
        toast.error("Não foi possível enviar a foto", "Tente novamente.");
        return;
      }

      const { data } = supabase.storage.from("estudantes-fotos").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("estudantes")
        .update({ foto_url: publicUrl })
        .eq("id", estudanteId);

      if (updateError) {
        toast.error("Foto enviada, mas não foi salva no cadastro", "Tente novamente.");
        return;
      }

      setFotoUrl(publicUrl);
      toast.success("Foto atualizada com sucesso.");
    });
  }

  function handleRemove() {
    if (!foto) return;

    startTransition(async () => {
      const supabase = createClient();
      await removeArquivosExistentes(supabase, foto);

      const { error: updateError } = await supabase
        .from("estudantes")
        .update({ foto_url: null })
        .eq("id", foto.estudanteId);

      if (updateError) {
        toast.error("Não foi possível remover a foto", "Tente novamente.");
        return;
      }

      setFotoUrl(null);
      toast.success("Foto removida com sucesso.");
    });
  }

  const podeEditarFoto = mode === "edit" && !!foto?.canEdit;

  const avatar = (
    <Avatar size="lg" clickable={podeEditarFoto} className={podeEditarFoto ? "size-full" : undefined}>
      {fotoUrl && <AvatarImage src={fotoUrl} alt={titulo} />}
      <AvatarFallback>
        {nomeCompleto ? getInitials(nomeCompleto) : <UserIcon size={20} strokeWidth={2} aria-hidden="true" />}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className="flex flex-wrap items-center gap-4 p-[24px]">
      {podeEditarFoto ? (
        <FileUpload
          onFileSelected={handleFile}
          onError={(message) => toast.error(message)}
          disabled={isPending}
          className="group relative size-[var(--space-6)] shrink-0 rounded-full border-none bg-transparent p-0 hover:bg-transparent"
        >
          {avatar}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-ink/50 opacity-0 transition-opacity duration-fast ease-standard group-hover:opacity-100">
            <Camera size={18} strokeWidth={2} className="text-white" aria-hidden="true" />
          </div>
        </FileUpload>
      ) : (
        avatar
      )}

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-highlight text-ink">{titulo}</h1>

        {mode === "edit" && situacao && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
            <Badge variant={SITUACAO_BADGE[situacao]}>{SITUACAO_LABEL[situacao] ?? situacao}</Badge>
            <span>· Turma: {turmaAtualLabel || "—"}</span>
            <span>· Matrícula: {matriculaInterna || "—"}</span>
            {podeEditarFoto && fotoUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPending}
                className="ml-2 flex items-center gap-[4px] text-[12.5px] text-muted transition-colors duration-fast ease-standard hover:text-danger disabled:pointer-events-none disabled:opacity-50"
              >
                <Trash2 size={12} strokeWidth={2} aria-hidden="true" />
                Remover foto
              </button>
            )}
          </div>
        )}
      </div>

      {acoes && <div className="shrink-0">{acoes}</div>}
    </div>
  );
}
