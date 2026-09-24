"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Eye, Loader2, MoreHorizontal, Trash2, Upload } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";

import {
  desfazerStatusDocumento,
  marcarNaoSeAplica,
  registrarEntregaFisica,
  salvarArquivoDocumento,
} from "@/app/(app)/estudantes/documentos-actions";
import type { DocumentoTipoFixo } from "@/app/(app)/estudantes/documentos-schema";
import type { DocumentoVersaoEstudante } from "@/app/(app)/estudantes/queries";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

type DocumentoLinhaProps = {
  estudanteId: string;
  escolaId: string;
  label: string;
  status: string;
  formaEntrega: "arquivo" | "fisica" | null;
  motivoNaoSeAplica: string | null;
  /** "Não se aplica" deduzido pelo sistema (ex.: primeira matrícula) — texto do motivo. */
  naoSeAplicaAutomatico?: string | null;
  dataEnvio: string | null;
  conferidoPorNome: string | null;
  arquivoPath: string | null;
  arquivoNome: string | null;
  versoesAnteriores: DocumentoVersaoEstudante[];
  canEdit: boolean;
} & ({ kind: "fixo"; tipo: DocumentoTipoFixo } | { kind: "extra"; docId: string; onRemove: () => void });

/**
 * Status do documento é consequência de ações, não um select: enviar
 * arquivo → Entregue; "Registrar entrega física" → Entregue (físico);
 * "Marcar como não se aplica" (com motivo) → Não se aplica. Entrega física e
 * "não se aplica" manual podem ser desfeitos; entrega por arquivo se corrige
 * enviando nova versão.
 */
export function DocumentoLinha(props: DocumentoLinhaProps) {
  const [isPending, startTransition] = useTransition();
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [pedindoMotivo, setPedindoMotivo] = useState(false);
  const [motivo, setMotivo] = useState("");
  const router = useRouter();

  const alvo = props.kind === "fixo" ? { tipo: props.tipo } : { docId: props.docId };
  const entregue = props.status === "entregue";
  const naoSeAplicaManual = props.status === "nao_se_aplica";
  const naoSeAplicaAuto = !entregue && !naoSeAplicaManual && !!props.naoSeAplicaAutomatico;
  const pendente = !entregue && !naoSeAplicaManual && !naoSeAplicaAuto;

  function executar(acao: () => Promise<{ error?: string } | { success: true }>, sucesso?: () => void) {
    startTransition(async () => {
      const result = await acao();
      if (result && "error" in result && result.error) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }
      sucesso?.();
      refreshAndBlur(router);
    });
  }

  function handleConfirmarNaoSeAplica() {
    if (!motivo.trim()) {
      toast.error("Informe o motivo.");
      return;
    }
    executar(
      () => marcarNaoSeAplica(props.estudanteId, alvo, motivo),
      () => {
        setPedindoMotivo(false);
        setMotivo("");
      },
    );
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
            <DetalheStatus {...props} naoSeAplicaAuto={naoSeAplicaAuto} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {entregue ? (
            <Badge variant="success">
              {props.formaEntrega === "fisica" ? "Entregue (físico)" : "Entregue"}
            </Badge>
          ) : naoSeAplicaManual || naoSeAplicaAuto ? (
            <Badge variant="neutral">Não se aplica</Badge>
          ) : (
            <Badge variant="warning">Pendente</Badge>
          )}

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

          {props.canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon
                  aria-label="Mais ações do documento"
                  disabled={isPending}
                >
                  <MoreHorizontal size={14} strokeWidth={2} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!entregue && (
                  <DropdownMenuItem
                    onSelect={() => executar(() => registrarEntregaFisica(props.estudanteId, alvo))}
                  >
                    Registrar entrega física
                  </DropdownMenuItem>
                )}
                {pendente && (
                  <DropdownMenuItem onSelect={() => setPedindoMotivo(true)}>
                    Marcar como não se aplica
                  </DropdownMenuItem>
                )}
                {entregue && props.formaEntrega === "fisica" && !props.arquivoPath && (
                  <DropdownMenuItem
                    onSelect={() => executar(() => desfazerStatusDocumento(props.estudanteId, alvo))}
                  >
                    Desfazer entrega física
                  </DropdownMenuItem>
                )}
                {naoSeAplicaManual && (
                  <DropdownMenuItem
                    onSelect={() => executar(() => desfazerStatusDocumento(props.estudanteId, alvo))}
                  >
                    Desfazer &ldquo;não se aplica&rdquo;
                  </DropdownMenuItem>
                )}
                {entregue && props.formaEntrega === "arquivo" && (
                  <DropdownMenuItem disabled>Para corrigir, envie uma nova versão</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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

      {pedindoMotivo && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={motivo}
            onChange={(event) => setMotivo(event.target.value)}
            placeholder="Motivo (ex.: estudante ainda não tem CPF emitido)"
            className="max-w-[420px]"
            autoFocus
          />
          <Button type="button" size="sm" onClick={handleConfirmarNaoSeAplica} disabled={isPending}>
            Confirmar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setPedindoMotivo(false);
              setMotivo("");
            }}
          >
            Cancelar
          </Button>
        </div>
      )}

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

function DetalheStatus(props: DocumentoLinhaProps & { naoSeAplicaAuto: boolean }) {
  const quando = props.dataEnvio ? dateFormatter.format(new Date(props.dataEnvio)) : null;
  const por = props.conferidoPorNome ? ` por ${props.conferidoPorNome}` : "";

  if (props.status === "entregue" && props.formaEntrega === "fisica" && !props.arquivoPath) {
    return <>Entrega física registrada{quando && ` em ${quando}`}{por}</>;
  }
  if (props.status === "entregue") {
    return (
      <>
        {props.arquivoNome ?? "Arquivo enviado"}
        {quando && ` · enviado em ${quando}`}
        {por}
      </>
    );
  }
  if (props.status === "nao_se_aplica") {
    return (
      <>
        {props.motivoNaoSeAplica ?? "Não se aplica"}
        {quando && ` · registrado em ${quando}`}
        {por}
      </>
    );
  }
  if (props.naoSeAplicaAuto) {
    return <>{props.naoSeAplicaAutomatico}</>;
  }
  return <>Nenhum arquivo enviado</>;
}
