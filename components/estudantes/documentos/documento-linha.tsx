"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Eye, Loader2, Trash2, Upload } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  salvarArquivoDocumento,
  salvarStatusDocumentoExtra,
  salvarStatusDocumentoFixo,
} from "@/app/(app)/estudantes/documentos-actions";
import { STATUS_DOCUMENTO_OPTIONS, type DocumentoTipoFixo } from "@/app/(app)/estudantes/documentos-schema";
import type { DocumentoVersaoEstudante } from "@/app/(app)/estudantes/queries";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

type DocumentoLinhaProps = {
  estudanteId: string;
  escolaId: string;
  label: string;
  status: string;
  dataEnvio: string | null;
  conferidoPorNome: string | null;
  arquivoPath: string | null;
  arquivoNome: string | null;
  versoesAnteriores: DocumentoVersaoEstudante[];
  canEdit: boolean;
} & ({ kind: "fixo"; tipo: DocumentoTipoFixo } | { kind: "extra"; docId: string; onRemove: () => void });

export function DocumentoLinha(props: DocumentoLinhaProps) {
  const [isPending, startTransition] = useTransition();
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const router = useRouter();

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result =
        props.kind === "fixo"
          ? await salvarStatusDocumentoFixo(
              props.estudanteId,
              props.tipo,
              status as "entregue" | "pendente" | "nao_se_aplica",
            )
          : await salvarStatusDocumentoExtra(
              props.estudanteId,
              props.docId,
              status as "entregue" | "pendente" | "nao_se_aplica",
            );

      if (result && "error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }
      refreshAndBlur(router);
    });
  }

  function handleFile(file: File | null) {
    if (!file) return;

    startTransition(async () => {
      const supabase = createClient();
      const extensao = file.name.split(".").pop() ?? "bin";
      const slot = props.kind === "fixo" ? props.tipo : props.docId;
      const path = `${props.escolaId}/${props.estudanteId}/documentos/${slot}/${crypto.randomUUID()}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from("estudantes-documentos")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        toast.error("Não foi possível enviar o arquivo", "Tente novamente.");
        return;
      }

      const result = await salvarArquivoDocumento(
        props.estudanteId,
        path,
        file.name,
        props.kind === "fixo" ? { tipo: props.tipo } : { docId: props.docId },
      );

      if (result && "error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }

      toast.success("Arquivo enviado com sucesso.");
      refreshAndBlur(router);
    });
  }

  function handleVisualizar(path: string) {
    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.storage.from("estudantes-documentos").createSignedUrl(path, 60);

      if (error || !data) {
        toast.error("Não foi possível abrir o arquivo", "Tente novamente.");
        return;
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div className="flex flex-col gap-2 border-b border-line py-[14px] last:border-b-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-ink">{props.label}</div>
          <div className="mt-[2px] text-[12.5px] text-muted">
            {props.arquivoNome ? props.arquivoNome : "Nenhum arquivo enviado"}
            {props.dataEnvio && ` · enviado em ${dateFormatter.format(new Date(props.dataEnvio))}`}
            {props.conferidoPorNome && ` · conferido por ${props.conferidoPorNome}`}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Select value={props.status} onValueChange={handleStatusChange} disabled={!props.canEdit || isPending}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_DOCUMENTO_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {props.arquivoPath && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon
              aria-label="Visualizar arquivo"
              onClick={() => handleVisualizar(props.arquivoPath!)}
              disabled={isPending}
            >
              <Eye size={14} strokeWidth={2} aria-hidden="true" />
            </Button>
          )}

          {props.canEdit && (
            <FileUpload
              accept="image/jpeg,image/png,application/pdf"
              onFileSelected={handleFile}
              onError={(message) => toast.error(message)}
              disabled={isPending}
              className="w-auto px-[10px] py-[7px]"
            >
              {isPending ? (
                <Loader2 size={14} strokeWidth={2} className="animate-spin text-muted" aria-hidden="true" />
              ) : (
                <Upload size={14} strokeWidth={2} className="text-muted" aria-hidden="true" />
              )}
            </FileUpload>
          )}

          {props.kind === "extra" && props.canEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon
              aria-label="Remover documento"
              onClick={props.onRemove}
              disabled={isPending}
            >
              <Trash2 size={14} strokeWidth={2} className="text-danger" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {props.versoesAnteriores.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setHistoricoAberto((aberto) => !aberto)}
            className="flex items-center gap-1 text-[12.5px] text-muted hover:text-ink"
          >
            {historicoAberto ? (
              <ChevronUp size={12} strokeWidth={2} aria-hidden="true" />
            ) : (
              <ChevronDown size={12} strokeWidth={2} aria-hidden="true" />
            )}
            Ver {props.versoesAnteriores.length} versão{props.versoesAnteriores.length === 1 ? "" : "ões"} anterior
            {props.versoesAnteriores.length === 1 ? "" : "es"}
          </button>

          {historicoAberto && (
            <ul className="mt-2 flex flex-col gap-2 border-l border-line pl-3">
              {props.versoesAnteriores.map((versao) => (
                <li key={versao.id} className="flex items-center justify-between gap-2 text-[12.5px] text-muted">
                  <span className="min-w-0 truncate">
                    v{versao.versao} · {versao.arquivoNome} · {dateFormatter.format(new Date(versao.enviadoEm))}
                    {versao.enviadoPorNome && ` · ${versao.enviadoPorNome}`}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon
                    aria-label="Visualizar versão anterior"
                    onClick={() => handleVisualizar(versao.arquivoPath)}
                    disabled={isPending}
                  >
                    <Eye size={12} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
