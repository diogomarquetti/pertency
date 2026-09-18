"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { refreshAndBlur } from "@/lib/utils";
import { toast } from "@/lib/use-toast";

import { salvarCondicao } from "@/app/(app)/estudantes/condicoes-actions";
import { TIPO_CONDICAO_OPTIONS } from "@/app/(app)/estudantes/condicoes-schema";
import type { CondicaoEstudante, DocumentoEstudante } from "@/app/(app)/estudantes/queries";
import { DOCUMENTO_TIPOS_FIXOS } from "@/app/(app)/estudantes/documentos-schema";

function labelDoDocumento(doc: DocumentoEstudante) {
  if (doc.tipo === "outro") return doc.nomeDocumento ?? "Documento";
  if (doc.tipo === "avaliacao_ingresso") return "Avaliação de Ingresso";
  return DOCUMENTO_TIPOS_FIXOS.find((item) => item.tipo === doc.tipo)?.label ?? doc.tipo;
}

/** Mesmo racional de contribuicao-drawer.tsx: estado vive no corpo montado
 * só enquanto o Sheet está aberto (Presence do Radix). */
function DrawerBody({
  estudanteId,
  editing,
  documentosDisponiveis,
  onOpenChange,
}: {
  estudanteId: string;
  editing: CondicaoEstudante | null;
  documentosDisponiveis: DocumentoEstudante[];
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [tipoCondicao, setTipoCondicao] = useState(editing?.tipoCondicao ?? "");
  const [documentoId, setDocumentoId] = useState(editing?.documentoId ?? "");
  const [observacoes, setObservacoes] = useState(editing?.observacoes ?? "");
  const [cid, setCid] = useState(editing?.cid ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!tipoCondicao) {
      setError("Selecione o tipo de condição.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await salvarCondicao(
        estudanteId,
        { tipoCondicao, documentoId, observacoes, cid },
        editing?.id,
      );

      if (result && "error" in result) {
        toast.error("Não foi possível salvar", result.error);
        return;
      }

      toast.success(editing ? "Condição atualizada." : "Condição adicionada.");
      refreshAndBlur(router);
      onOpenChange(false);
    });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{editing ? "Editar condição" : "Adicionar condição"}</SheetTitle>
      </SheetHeader>

      <SheetBody className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label>Tipo de condição</Label>
          <Select value={tipoCondicao} onValueChange={setTipoCondicao}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent>
              {TIPO_CONDICAO_OPTIONS.map((opcao) => (
                <SelectItem key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>
            Documento vinculado <span className="font-normal text-muted">(opcional)</span>
          </Label>
          <Select value={documentoId} onValueChange={setDocumentoId}>
            <SelectTrigger>
              <SelectValue placeholder="Nenhum" />
            </SelectTrigger>
            <SelectContent>
              {documentosDisponiveis.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {labelDoDocumento(doc)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[12px] text-muted">
            Referencia um documento já existente na aba Documentos — não duplica upload.
          </p>
        </div>

        <div className="grid gap-2">
          <Label>
            Observações sobre a condição <span className="font-normal text-muted">(opcional)</span>
          </Label>
          <Textarea
            value={observacoes}
            onChange={(event) => setObservacoes(event.target.value)}
            placeholder="Informação escolar/funcional objetiva…"
          />
        </div>

        <div className="grid gap-2">
          <Label>
            CID <span className="font-normal text-muted">(opcional)</span>
          </Label>
          <Input value={cid} onChange={(event) => setCid(event.target.value)} />
        </div>

        {error && (
          <p className="flex items-center gap-[5px] text-[12.5px] text-danger" role="alert">
            <AlertCircle size={14} strokeWidth={2} className="shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </SheetBody>

      <SheetFooter>
        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" size={15} strokeWidth={2} aria-hidden="true" />}
          {editing ? "Salvar" : "Adicionar"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function CondicaoDrawer({
  open,
  onOpenChange,
  estudanteId,
  editing,
  documentosDisponiveis,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudanteId: string;
  editing: CondicaoEstudante | null;
  documentosDisponiveis: DocumentoEstudante[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <DrawerBody
          estudanteId={estudanteId}
          editing={editing}
          documentosDisponiveis={documentosDisponiveis}
          onOpenChange={onOpenChange}
        />
      </SheetContent>
    </Sheet>
  );
}
