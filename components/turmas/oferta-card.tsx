"use client";

import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { useSelecaoUnica } from "@/lib/use-selecao-unica";
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
  OFERTAS_SERE,
  getEtapasDoCicloEf,
  getOfertaSere,
  isOrganizacaoAtiva,
  ofertaSereLabel,
  organizacaoLabel,
  organizacaoPermitida,
  type OfertaSereConfig,
} from "@/lib/ofertas-config";
import type { UpdateTurmaValues } from "@/app/(app)/turmas/schema";
import type { ReferenciaTurmaForm } from "@/app/(app)/turmas/queries";

/**
 * Trocar a oferta reseta organização, ciclo, etapas, matriz e todos os
 * campos do bloco de organização específica — eles são específicos da
 * oferta anterior e não fazem sentido carregados pra outra. (Exceção: entre
 * 6005 e 6046 a organização continua valendo, então nada é limpo.)
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

/** Forma de funcionamento fixada pela oferta, quando a regra não é "livre". */
function aplicarRegraFuncionamento(form: UseFormReturn<UpdateTurmaValues>, ofertaSere: OfertaSereConfig | undefined) {
  const regra = ofertaSere?.formaFuncionamentoRegra;
  if (regra && regra !== "livre") {
    form.setValue("formaFuncionamento", regra, { shouldDirty: true, shouldValidate: true });
  }
}

export function OfertaCard({
  form,
  referencia,
  canEdit,
}: {
  form: UseFormReturn<UpdateTurmaValues>;
  referencia: ReferenciaTurmaForm;
  canEdit: boolean;
}) {
  const ofertaSere = form.watch("ofertaSere");
  const ofertaSlug = form.watch("ofertaSlug");
  const ofertaId = form.watch("ofertaId");
  const organizacaoId = form.watch("organizacaoId");
  const ciclo = form.watch("ciclo");

  const ofertaSereAtual = getOfertaSere(ofertaSere);
  const organizacaoAtual = referencia.organizacoes.find((o) => o.id === organizacaoId);
  // As permitidas na oferta, mais a já gravada (pra turma antiga continuar abrindo).
  const organizacoesFiltradas = referencia.organizacoes.filter(
    (o) => o.ofertaId === ofertaId && (organizacaoPermitida(ofertaSere, o.codigo) || o.id === organizacaoId),
  );
  const organizacoesPermitidas = organizacoesFiltradas.filter((o) => organizacaoPermitida(ofertaSere, o.codigo));
  const organizacaoUnica =
    organizacoesPermitidas.length === 1 && organizacaoAtual?.id === organizacoesPermitidas[0].id;
  const temMatriz = !ofertaSereAtual || ofertaSereAtual.estruturaDefinida;

  const isEf = ofertaSlug === "ef";
  const etapasDoCiclo = getEtapasDoCicloEf(Number(ciclo) || null);
  const matrizIdAtual = form.watch("matrizCurricularId");
  // A matriz já gravada sempre aparece (turma antiga do EF ainda sem ciclo).
  const matrizesFiltradas = referencia.matrizes.filter(
    (m) => m.id === matrizIdAtual || (m.ofertaId === ofertaId && (!isEf || m.ciclo === Number(ciclo))),
  );

  const regraFuncionamento = ofertaSereAtual?.formaFuncionamentoRegra;
  const funcionamentoTravado = !!regraFuncionamento && regraFuncionamento !== "livre";

  function selecionarOrganizacao(id: string) {
    form.setValue("organizacaoId", id, { shouldDirty: true, shouldValidate: !!id });
  }

  function selecionarOferta(codigo: string) {
    const nova = getOfertaSere(codigo);
    const grupo = referencia.ofertas.find((o) => o.slug === nova?.ofertaSlug);
    const mantemOrganizacao =
      grupo?.id === ofertaId && organizacaoPermitida(codigo, organizacaoAtual?.codigo);

    form.setValue("ofertaId", grupo?.id ?? "", { shouldDirty: true });
    form.setValue("ofertaSlug", (nova?.ofertaSlug ?? "") as UpdateTurmaValues["ofertaSlug"], { shouldDirty: true });
    form.setValue("ofertaSere", codigo, { shouldDirty: true, shouldValidate: true });
    aplicarRegraFuncionamento(form, nova);
    if (mantemOrganizacao) return;

    limparCamposDependentes(form);
  }

  // Uma só opção já vem escolhida (ex.: 6053 → Ciclo Contínuo; EF com
  // ciclo escolhido → a matriz do ciclo).
  useSelecaoUnica(organizacaoId, organizacoesPermitidas, selecionarOrganizacao, canEdit);
  useSelecaoUnica(
    matrizIdAtual,
    temMatriz && (!isEf || ciclo) ? matrizesFiltradas : [],
    (id) => form.setValue("matrizCurricularId", id, { shouldDirty: true, shouldValidate: true }),
    canEdit,
  );

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">2.</span> Oferta e organização
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="ofertaSere"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Oferta</FormLabel>
              <Select value={field.value} onValueChange={selecionarOferta}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a oferta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {OFERTAS_SERE.map((oferta) => (
                    <SelectItem key={oferta.codigo} value={oferta.codigo}>
                      {ofertaSereLabel(oferta)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!field.value && organizacaoId && (
                <FormDescription className="text-danger">
                  Escolha a oferta com o código SERE para salvar a turma.
                </FormDescription>
              )}
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
                // O select às vezes devolve "" enquanto as opções trocam.
                onValueChange={(id) => id && selecionarOrganizacao(id)}
                disabled={!ofertaSere || organizacaoUnica}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={ofertaSere ? "Selecione…" : "Selecione a oferta primeiro"}
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
              {organizacaoAtual && !isOrganizacaoAtiva(organizacaoAtual.codigo) && (
                <FormDescription className="text-danger">
                  Esta organização foi descontinuada. Escolha uma nova para salvar a turma.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {isEf && (
          <FormField
            control={form.control}
            name="ciclo"
            render={({ field }) => (
              <FormItem className="sm:col-start-1">
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

        {temMatriz && (
        <FormField
          control={form.control}
          name="matrizCurricularId"
          render={({ field }) => (
            <FormItem className="sm:col-start-1">
              <FormLabel>Matriz curricular vinculada</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!ofertaSere || (isEf && !ciclo)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !ofertaSere
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
        )}

        <FormField
          control={form.control}
          name="formaFuncionamento"
          render={({ field }) => (
            <FormItem className={cn(!temMatriz && "sm:col-start-1")}>
              <FormLabel>Forma de funcionamento</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={!ofertaSere || funcionamentoTravado}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={ofertaSere ? "Selecione…" : "Selecione a oferta primeiro"}
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
                <FormDescription>Definido pela oferta</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
}
