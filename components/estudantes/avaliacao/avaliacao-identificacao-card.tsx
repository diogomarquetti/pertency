"use client";

import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { organizacaoLabel, organizacoesSelecionaveis } from "@/lib/ofertas-config";
import { useSelecaoUnica } from "@/lib/use-selecao-unica";
import {
  STATUS_AVALIACAO_LABEL,
  camposFaltantesConclusao,
  podeComporEquipe,
  type AvaliacaoValues,
} from "@/app/(app)/estudantes/avaliacao-schema";
import type { ReferenciaOfertas, UsuarioElegivel } from "@/app/(app)/estudantes/queries";

import { STATUS_AVALIACAO_BADGE } from "./versao-avaliacao-card";

function toggleValue(current: string[], value: string) {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

export function AvaliacaoIdentificacaoCard({
  form,
  equipeElegivel,
  referenciaOfertas,
  podeConcluir,
  canEdit,
  statusSalvo,
}: {
  form: UseFormReturn<AvaliacaoValues>;
  equipeElegivel: UsuarioElegivel[];
  referenciaOfertas: ReferenciaOfertas;
  /** Concluir: Pedagogo(a) e Administrador — ver pode_concluir_avaliacao(). */
  podeConcluir: boolean;
  canEdit: boolean;
  /** Status gravado da versão (Rascunho na primeira). Quem calcula é o servidor ao salvar. */
  statusSalvo: string;
}) {
  // Secretaria não é selecionável; só continua visível (em leitura) onde já
  // estava na equipe de uma avaliação antiga.
  const equipeSelecionada = form.watch("equipeResponsavelIds");
  const equipeVisivel = equipeElegivel.filter(
    (usuario) => podeComporEquipe(usuario.perfil) || (!canEdit && equipeSelecionada.includes(usuario.id)),
  );
  const faltantes = camposFaltantesConclusao(form.watch());
  const ofertaPretendidaId = form.watch("ofertaPretendidaId");
  const organizacaoPretendidaId = form.watch("organizacaoPretendidaId");
  const organizacoesFiltradas = organizacoesSelecionaveis(
    referenciaOfertas.organizacoes,
    ofertaPretendidaId,
    organizacaoPretendidaId,
  );
  useSelecaoUnica(
    organizacaoPretendidaId,
    ofertaPretendidaId ? organizacoesFiltradas : [],
    (id) => form.setValue("organizacaoPretendidaId", id, { shouldDirty: true, shouldValidate: true }),
    canEdit,
  );

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">1.</span> Identificação da avaliação
      </h2>

      <div className="grid gap-2">
        <Label>Equipe responsável</Label>
        <div className="rounded-sm border border-line px-[10px]">
          {equipeVisivel.length === 0 ? (
            <p className="py-[9px] text-[13px] text-muted">Nenhum usuário ativo encontrado.</p>
          ) : (
            <FormField
              control={form.control}
              name="equipeResponsavelIds"
              render={({ field }) => (
                <>
                  {equipeVisivel.map((usuario, index) => (
                    <label
                      key={usuario.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-[10px] py-[9px] text-[14px] text-ink",
                        index > 0 && "border-t border-line",
                      )}
                    >
                      <Checkbox
                        checked={field.value.includes(usuario.id)}
                        onCheckedChange={() => field.onChange(toggleValue(field.value, usuario.id))}
                      />
                      <span>
                        {usuario.nome}{" "}
                        <span className="text-[13px] text-muted">· {usuario.funcao}</span>
                      </span>
                    </label>
                  ))}
                </>
              )}
            />
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="ofertaPretendidaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Oferta pretendida</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("organizacaoPretendidaId", "");
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {referenciaOfertas.ofertas.map((oferta) => (
                    <SelectItem key={oferta.id} value={oferta.id}>
                      {oferta.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organizacaoPretendidaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organização pretendida</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={!ofertaPretendidaId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={ofertaPretendidaId ? "Selecione…" : "Selecione a oferta primeiro"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {organizacoesFiltradas.map((organizacao) => (
                    <SelectItem key={organizacao.id} value={organizacao.id}>
                      {organizacaoLabel(organizacao)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataInicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Data de início <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataTermino"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Data de término <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-[6px] sm:col-span-2">
          <Label>Status da avaliação</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_AVALIACAO_BADGE[statusSalvo] ?? "neutral"}>
              {STATUS_AVALIACAO_LABEL[statusSalvo] ?? statusSalvo}
            </Badge>
            <p className="text-[12.5px] text-muted">
              {statusSalvo === "concluida"
                ? "Concluída."
                : faltantes.length === 0
                  ? podeConcluir
                    ? "Campos mínimos preenchidos: a avaliação será concluída ao salvar."
                    : "Campos mínimos preenchidos. Falta um(a) Pedagogo(a) ou Administrador salvar para concluir."
                  : `Passa para Concluída sozinha ao salvar com os campos mínimos preenchidos. Faltam: ${faltantes.join(", ")}.`}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
