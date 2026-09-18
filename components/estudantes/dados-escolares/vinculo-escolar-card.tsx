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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { SITUACAO_OPTIONS } from "@/app/(app)/estudantes/schema";
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
import { getEtapasDoCiclo, type OfertaSlug } from "@/app/(app)/turmas/schema";

function limparCamposDependentes(form: UseFormReturn<DadosEscolaresValues>) {
  form.setValue("organizacaoAtualId", "", { shouldDirty: true });
  form.setValue("etapaDoCiclo", "");
  form.setValue("turmaId", "");
}

// Trocar o ano letivo troca qual vínculo está sendo editado — cada ano tem o
// seu (regra 18.1: trocar de ano não pode sobrescrever o vínculo anterior).
// Quando o ano já tem vínculo salvo, carrega os valores dele; quando é um
// ano novo, sugere oferta/organização/turno do vínculo mais recente (mas
// deixa turma, matrícula e data em branco — exige reconfirmação, não
// promove sozinho) e nunca salva nada até o usuário clicar em Salvar.
function aplicarVinculoDoAno(
  form: UseFormReturn<DadosEscolaresValues>,
  anoLetivoId: string,
  vinculosEscolaresAnuais: VinculoEscolarAnual[],
) {
  const vinculoDoAno = vinculosEscolaresAnuais.find((v) => v.anoLetivoId === anoLetivoId);

  if (vinculoDoAno) {
    form.setValue("ofertaAtualId", vinculoDoAno.ofertaAtualId, { shouldDirty: true });
    form.setValue("ofertaAtualSlug", vinculoDoAno.ofertaAtualSlug as OfertaSlug);
    form.setValue("organizacaoAtualId", vinculoDoAno.organizacaoAtualId);
    form.setValue("etapaDoCiclo", vinculoDoAno.etapaDoCiclo);
    form.setValue("turnoId", vinculoDoAno.turnoId);
    form.setValue("turmaId", vinculoDoAno.turmaId);
    form.setValue("matriculaInterna", vinculoDoAno.matriculaInterna);
    form.setValue("utilizaTransporte", vinculoDoAno.utilizaTransporte);
    form.setValue("dataMatriculaEfetiva", vinculoDoAno.dataMatriculaEfetiva);
    return;
  }

  const maisRecente = vinculosEscolaresAnuais[0];
  form.setValue("ofertaAtualId", maisRecente?.ofertaAtualId ?? "", { shouldDirty: true });
  form.setValue("ofertaAtualSlug", (maisRecente?.ofertaAtualSlug ?? "") as OfertaSlug);
  form.setValue("organizacaoAtualId", maisRecente?.organizacaoAtualId ?? "");
  form.setValue("turnoId", maisRecente?.turnoId ?? "");
  form.setValue("etapaDoCiclo", "");
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
}: {
  form: UseFormReturn<DadosEscolaresValues>;
  avaliacao: AvaliacaoIngresso | null;
  referenciaOfertas: ReferenciaOfertas;
  turnos: { id: string; nome: string }[];
  turmasReferencia: TurmaOption[];
  anosLetivos: AnoLetivoOption[];
  vinculosEscolaresAnuais: VinculoEscolarAnual[];
}) {
  const anoLetivoId = form.watch("anoLetivoId");
  const ofertaAtualSlug = form.watch("ofertaAtualSlug");
  const ofertaAtualId = form.watch("ofertaAtualId");
  const organizacaoAtualId = form.watch("organizacaoAtualId");

  const organizacoesFiltradas = referenciaOfertas.organizacoes.filter(
    (organizacao) => organizacao.ofertaId === ofertaAtualId,
  );
  // Turma precisa bater com a oferta e com o ano letivo do vínculo sendo
  // editado (CA23 da HU-EST-001 v2.0) — sem ano letivo selecionado ainda
  // não faz sentido listar nenhuma.
  const turmasFiltradas = turmasReferencia.filter(
    (turma) => turma.ofertaId === ofertaAtualId && turma.anoLetivoId === anoLetivoId,
  );
  const organizacaoNome = referenciaOfertas.organizacoes.find(
    (organizacao) => organizacao.id === organizacaoAtualId,
  )?.nome;
  const etapasDoCiclo = getEtapasDoCiclo(organizacaoNome);

  const ofertaPretendidaNome = referenciaOfertas.ofertas.find(
    (oferta) => oferta.id === avaliacao?.ofertaPretendidaId,
  )?.nome;
  const organizacaoPretendidaNome = referenciaOfertas.organizacoes.find(
    (organizacao) => organizacao.id === avaliacao?.organizacaoPretendidaId,
  )?.nome;

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">1.</span> Vínculo escolar
      </h2>

      {(ofertaPretendidaNome || organizacaoPretendidaNome) && (
        <p className="text-[13px] text-muted">
          Oferta/organização pretendida na Avaliação de Ingresso:{" "}
          <span className="text-ink">
            {[ofertaPretendidaNome, organizacaoPretendidaNome].filter(Boolean).join(" — ")}
          </span>
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="situacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situação do estudante</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SITUACAO_OPTIONS.map((situacao) => (
                    <SelectItem key={situacao.value} value={situacao.value}>
                      {situacao.label}
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
          name="ofertaAtualId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Oferta atual</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  const oferta = referenciaOfertas.ofertas.find((o) => o.id === value);
                  field.onChange(value);
                  form.setValue("ofertaAtualSlug", (oferta?.slug ?? "") as OfertaSlug, {
                    shouldDirty: true,
                  });
                  limparCamposDependentes(form);
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
          name="organizacaoAtualId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organização atual</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={!ofertaAtualId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={ofertaAtualId ? "Selecione…" : "Selecione a oferta primeiro"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {organizacoesFiltradas.map((organizacao) => (
                    <SelectItem key={organizacao.id} value={organizacao.id}>
                      {organizacao.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {ofertaAtualSlug === "ef" && (
          <FormField
            control={form.control}
            name="etapaDoCiclo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etapa do ciclo</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={!organizacaoAtualId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={organizacaoAtualId ? "Selecione…" : "Selecione a organização primeiro"}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {etapasDoCiclo.map((etapa) => (
                      <SelectItem key={etapa} value={etapa}>
                        {etapa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="turnoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turno</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
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
                disabled={!ofertaAtualId || !anoLetivoId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !anoLetivoId
                          ? "Selecione o ano letivo primeiro"
                          : ofertaAtualId
                            ? "Selecione…"
                            : "Selecione a oferta primeiro"
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
              <FormLabel>Matrícula interna</FormLabel>
              <FormControl>
                <Input {...field} />
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
