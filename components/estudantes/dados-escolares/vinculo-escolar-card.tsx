"use client";

import type { UseFormReturn } from "react-hook-form";

import { Card } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";

import {
  FORMA_INGRESSO_OPTIONS,
  type DadosEscolaresValues,
} from "@/app/(app)/estudantes/dados-escolares-schema";
import type {
  AnoLetivoOption,
  AvaliacaoIngresso,
  ReferenciaOfertas,
  TurmaOption,
  VinculoEscolarAnual,
} from "@/app/(app)/estudantes/queries";
import { organizacaoLabel } from "@/lib/ofertas-config";
import { useSelecaoUnica } from "@/lib/use-selecao-unica";

// Trocar o ano letivo troca qual vínculo está sendo editado — cada ano tem o
// seu (regra 18.1: trocar de ano não pode sobrescrever o vínculo anterior).
// Quando o ano já tem vínculo salvo, carrega os valores dele; quando é um
// ano novo, sugere o turno do vínculo mais recente (mas
// deixa turma, matrícula e data em branco — exige reconfirmação, não
// promove sozinho) e nunca salva nada até o usuário clicar em Salvar.
function aplicarVinculoDoAno(
  form: UseFormReturn<DadosEscolaresValues>,
  anoLetivoId: string,
  vinculosEscolaresAnuais: VinculoEscolarAnual[],
) {
  const vinculoDoAno = vinculosEscolaresAnuais.find((v) => v.anoLetivoId === anoLetivoId);

  if (vinculoDoAno) {
    form.setValue("turnoId", vinculoDoAno.turnoId);
    form.setValue("turmaId", vinculoDoAno.turmaId);
    form.setValue("matriculaInterna", vinculoDoAno.matriculaInterna);
    form.setValue("utilizaTransporte", vinculoDoAno.utilizaTransporte);
    form.setValue("dataMatriculaEfetiva", vinculoDoAno.dataMatriculaEfetiva);
    return;
  }

  const maisRecente = vinculosEscolaresAnuais[0];
  form.setValue("turnoId", maisRecente?.turnoId ?? "");
  form.setValue("turmaId", "");
  form.setValue("matriculaInterna", "");
  form.setValue("utilizaTransporte", false);
  form.setValue("dataMatriculaEfetiva", "");
}

export function VinculoEscolarCard({
  form,
  avaliacao,
  referenciaOfertas,
  turnos,
  turmasReferencia,
  anosLetivos,
  vinculosEscolaresAnuais,
  canEdit,
}: {
  form: UseFormReturn<DadosEscolaresValues>;
  avaliacao: AvaliacaoIngresso | null;
  referenciaOfertas: ReferenciaOfertas;
  turnos: { id: string; nome: string }[];
  turmasReferencia: TurmaOption[];
  anosLetivos: AnoLetivoOption[];
  vinculosEscolaresAnuais: VinculoEscolarAnual[];
  canEdit: boolean;
}) {
  const anoLetivoId = form.watch("anoLetivoId");
  const turnoId = form.watch("turnoId");

  // Oferta e organização aparecem só para leitura: a da turma escolhida
  // (que vira a do vínculo ao salvar) ou, sem turma, a pretendida na
  // Avaliação de Ingresso.
  const turmaEscolhida = turmasReferencia.find((turma) => turma.id === form.watch("turmaId"));
  const ofertaId = turmaEscolhida?.ofertaId ?? avaliacao?.ofertaPretendidaId;
  const organizacaoId = turmaEscolhida?.organizacaoId ?? avaliacao?.organizacaoPretendidaId;
  const ofertaNome = referenciaOfertas.ofertas.find((oferta) => oferta.id === ofertaId)?.nome;
  const organizacao = referenciaOfertas.organizacoes.find((item) => item.id === organizacaoId);

  // Oferta e organização não são mais escolhidas aqui: a pretendida está na
  // Avaliação de Ingresso e a atual do vínculo vem da turma (ver
  // dados-escolares-actions.ts). A turma só precisa bater com turno e ano
  // letivo (CA22/CA23 da HU-EST-001 v2.0).
  const turmasFiltradas = turmasReferencia.filter(
    (turma) => turma.turnoId === turnoId && turma.anoLetivoId === anoLetivoId,
  );

  const faltaFiltroTurma = !anoLetivoId
    ? "Selecione o ano letivo primeiro"
    : !turnoId
      ? "Selecione o turno primeiro"
      : null;
  // Uma só opção compatível já vem escolhida.
  useSelecaoUnica(
    form.watch("turmaId"),
    !faltaFiltroTurma ? turmasFiltradas : [],
    (id) => form.setValue("turmaId", id, { shouldDirty: true, shouldValidate: true }),
    canEdit,
  );

  // Trocar o turno só limpa a turma se ela deixar de ser compatível.
  function limparTurmaSeIncompativel(novoTurnoId: string) {
    const turmaAtual = turmasReferencia.find((turma) => turma.id === form.getValues("turmaId"));
    if (turmaAtual && turmaAtual.turnoId !== novoTurnoId) {
      form.setValue("turmaId", "", { shouldDirty: true });
    }
  }

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">1.</span> Vínculo escolar
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-[6px]">
          <Label>Oferta</Label>
          <Input value={ofertaNome ?? "—"} readOnly disabled />
        </div>
        <div className="grid gap-[6px]">
          <Label>Organização</Label>
          <Input value={organizacao ? organizacaoLabel(organizacao) : "—"} readOnly disabled />
        </div>

        <FormField
          control={form.control}
          name="anoLetivoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano letivo</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  aplicarVinculoDoAno(form, value, vinculosEscolaresAnuais);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {anosLetivos.map((anoLetivo) => (
                    <SelectItem key={anoLetivo.id} value={anoLetivo.id}>
                      {anoLetivo.ano}
                      {anoLetivo.status !== "ativo" ? ` (${anoLetivo.status})` : ""}
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
          name="dataIngresso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Data de ingresso <span className="font-normal text-muted">(opcional)</span>
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
          name="formaIngresso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Forma de ingresso <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FORMA_INGRESSO_OPTIONS.map((opcao) => (
                    <SelectItem key={opcao.value} value={opcao.value}>
                      {opcao.label}
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
          name="turnoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turno</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  limparTurmaSeIncompativel(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {turnos.map((turno) => (
                    <SelectItem key={turno.id} value={turno.id}>
                      {turno.nome}
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
          name="turmaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turma</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!!faltaFiltroTurma}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        faltaFiltroTurma ??
                        (turmasFiltradas.length === 0 ? "Nenhuma turma compatível" : "Selecione…")
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {turmasFiltradas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome}
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
          name="matriculaInterna"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de matrícula</FormLabel>
              <FormControl>
                <Input placeholder="Nº do SERE ou outro número oficial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataMatriculaEfetiva"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de matrícula efetiva</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="utilizaTransporte"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-[10px] space-y-0">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">Utiliza transporte escolar</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
}
