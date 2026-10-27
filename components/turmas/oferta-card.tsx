"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
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

import {
  CICLOS_EF,
  FORMA_FUNCIONAMENTO_OPTIONS,
  etapaLabel,
  getEtapasDoCicloEf,
  getOrganizacaoConfig,
  organizacaoLabel,
  organizacoesSelecionaveis,
} from "@/lib/ofertas-config";
import { OFERTA_OPTIONS, type OfertaSlug, type UpdateTurmaValues } from "@/app/(app)/turmas/schema";
import type { ReferenciaTurmaForm } from "@/app/(app)/turmas/queries";

/**
 * Trocar a oferta reseta organização, ciclo, etapas, matriz e todos os
 * campos do bloco de organização específica — eles são específicos da
 * oferta anterior e não fazem sentido carregados pra outra.
 */
function limparCamposDependentes(form: UseFormReturn<UpdateTurmaValues>) {
  form.setValue("organizacaoId", "", { shouldDirty: true });
  form.setValue("ciclo", "", { shouldDirty: true });
  form.setValue("etapas", [], { shouldDirty: true });
  form.setValue("matrizCurricularId", "", { shouldDirty: true });
  form.setValue("objetivoGeral", "");
  form.setValue("areasConhecimento", []);
  form.setValue("componenteIds", []);
  form.setValue("unidadesOcupacionais", []);
  form.setValue("eixosFuncionais", []);
}

/** Forma de funcionamento fixada pela organização, quando a regra não é "livre". */
function aplicarRegraFuncionamento(form: UseFormReturn<UpdateTurmaValues>, codigo: string | null | undefined) {
  const regra = getOrganizacaoConfig(codigo)?.formaFuncionamentoRegra;
  if (regra && regra !== "livre") {
    form.setValue("formaFuncionamento", regra, { shouldDirty: true, shouldValidate: true });
  }
}

export function OfertaCard({
  form,
  referencia,
}: {
  form: UseFormReturn<UpdateTurmaValues>;
  referencia: ReferenciaTurmaForm;
}) {
  const ofertaSlug = form.watch("ofertaSlug");
  const ofertaId = form.watch("ofertaId");
  const organizacaoId = form.watch("organizacaoId");
  const ciclo = form.watch("ciclo");

  const organizacaoAtual = referencia.organizacoes.find((o) => o.id === organizacaoId);
  const configAtual = getOrganizacaoConfig(organizacaoAtual?.codigo);
  const organizacoesFiltradas = organizacoesSelecionaveis(referencia.organizacoes, ofertaId, organizacaoId);
  const organizacoesAtivas = organizacoesFiltradas.filter((o) => getOrganizacaoConfig(o.codigo));
  const organizacaoUnica = organizacoesAtivas.length === 1 && organizacaoAtual?.id === organizacoesAtivas[0].id;

  const isEf = ofertaSlug === "ef";
  const etapasDoCiclo = getEtapasDoCicloEf(Number(ciclo) || null);
  const matrizIdAtual = form.watch("matrizCurricularId");
  // A matriz já gravada sempre aparece (turma antiga do EF ainda sem ciclo).
  const matrizesFiltradas = referencia.matrizes.filter(
    (m) => m.id === matrizIdAtual || (m.ofertaId === ofertaId && (!isEf || m.ciclo === Number(ciclo))),
  );

  const regraFuncionamento = configAtual?.formaFuncionamentoRegra;
  const funcionamentoTravado = !!regraFuncionamento && regraFuncionamento !== "livre";

  function selecionarOrganizacao(id: string) {
    form.setValue("organizacaoId", id, { shouldDirty: true, shouldValidate: !!id });
    aplicarRegraFuncionamento(form, referencia.organizacoes.find((o) => o.id === id)?.codigo);
  }

  // Matriz é escolhida automaticamente quando só uma serve (ex.: EF com
  // ciclo escolhido — uma matriz por ciclo).
  useEffect(() => {
    if (!matrizIdAtual && matrizesFiltradas.length === 1) {
      form.setValue("matrizCurricularId", matrizesFiltradas[0].id, { shouldDirty: true, shouldValidate: true });
    }
  }, [form, matrizIdAtual, matrizesFiltradas]);

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">2.</span> Oferta e organização
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="ofertaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Oferta</FormLabel>
              <Select
                value={ofertaSlug}
                onValueChange={(slug) => {
                  const oferta = referencia.ofertas.find((o) => o.slug === slug);
                  field.onChange(oferta?.id ?? "");
                  form.setValue("ofertaSlug", slug as OfertaSlug, { shouldDirty: true });
                  limparCamposDependentes(form);
                  // Oferta com uma só organização ativa já vem preenchida.
                  const ativas = referencia.organizacoes.filter(
                    (o) => o.ofertaId === oferta?.id && getOrganizacaoConfig(o.codigo),
                  );
                  if (ativas.length === 1) {
                    selecionarOrganizacao(ativas[0].id);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a oferta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {OFERTA_OPTIONS.map((oferta) => (
                    <SelectItem key={oferta.slug} value={oferta.slug}>
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
          name="organizacaoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organização da oferta</FormLabel>
              <Select
                value={field.value}
                onValueChange={selecionarOrganizacao}
                disabled={!ofertaId || organizacaoUnica}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={ofertaId ? "Selecione…" : "Selecione a oferta primeiro"}
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
              {organizacaoAtual && !configAtual && (
                <FormDescription className="text-danger">
                  Esta organização foi descontinuada. Escolha uma nova para salvar a turma.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {configAtual?.codigoSere && (
          <div className="grid gap-2">
            <Label htmlFor="turma-codigo-sere">Código SERE</Label>
            <Input id="turma-codigo-sere" value={configAtual.codigoSere} disabled readOnly />
          </div>
        )}

        {isEf && (
          <FormField
            control={form.control}
            name="ciclo"
            render={({ field }) => (
              <FormItem className={cn(!configAtual?.codigoSere && "sm:col-start-1")}>
                <FormLabel>Ciclo</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Etapas e matriz dependem do ciclo.
                    form.setValue("etapas", [], { shouldDirty: true });
                    form.setValue("matrizCurricularId", "", { shouldDirty: true });
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ciclo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CICLOS_EF.map((item) => (
                      <SelectItem key={item.value} value={String(item.value)}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isEf && (
          <FormField
            control={form.control}
            name="etapas"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Etapas</FormLabel>
                {etapasDoCiclo.length === 0 ? (
                  <p className="text-[13px] text-muted">Selecione o ciclo para escolher as etapas.</p>
                ) : (
                  <div className="grid rounded-sm border border-line px-[10px] sm:grid-cols-3">
                    {etapasDoCiclo.map((etapa, index) => (
                      <label
                        key={etapa}
                        className={cn(
                          "flex cursor-pointer items-center gap-[10px] py-[9px] text-[14px] text-ink",
                          index > 0 && "border-t border-line sm:border-t-0",
                          index > 2 && "sm:border-t",
                        )}
                      >
                        <Checkbox
                          checked={field.value.includes(etapa)}
                          onCheckedChange={() =>
                            field.onChange(
                              field.value.includes(etapa)
                                ? field.value.filter((v) => v !== etapa)
                                : [...field.value, etapa].sort((a, b) => a - b),
                            )
                          }
                        />
                        {etapaLabel(etapa)}
                      </label>
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="matrizCurricularId"
          render={({ field }) => (
            <FormItem className="sm:col-start-1">
              <FormLabel>Matriz curricular vinculada</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!ofertaId || (isEf && !ciclo)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !ofertaId
                          ? "Selecione a oferta primeiro"
                          : isEf && !ciclo
                            ? "Selecione o ciclo primeiro"
                            : "Selecione…"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {matrizesFiltradas.map((matriz) => (
                    <SelectItem key={matriz.id} value={matriz.id}>
                      {matriz.nome}
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
          name="formaFuncionamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de funcionamento</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={!organizacaoId || funcionamentoTravado}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={organizacaoId ? "Selecione…" : "Selecione a organização primeiro"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FORMA_FUNCIONAMENTO_OPTIONS.map((opcao) => (
                    <SelectItem key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {funcionamentoTravado && (
                <FormDescription>
                  {configAtual?.codigoSere
                    ? `Definido pela oferta (SERE ${configAtual.codigoSere})`
                    : "Definido pela oferta"}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
}
