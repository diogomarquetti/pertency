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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { OFERTA_OPTIONS, type OfertaSlug, type UpdateTurmaValues } from "@/app/(app)/turmas/schema";
import type { ReferenciaTurmaForm } from "@/app/(app)/turmas/queries";

/**
 * Trocar a oferta reseta organização, matriz e todos os campos do Bloco 3
 * (Estrutura curricular) — eles são específicos da oferta anterior e não
 * fazem sentido carregados pra outra (regra 5 do Bloco 2 da história).
 */
function limparCamposDependentes(form: UseFormReturn<UpdateTurmaValues>) {
  form.setValue("organizacaoId", "", { shouldDirty: true });
  form.setValue("matrizCurricularId", "", { shouldDirty: true });
  form.setValue("camposExperiencias", []);
  form.setValue("direitosAprendizagem", []);
  form.setValue("objetivoGeral", "");
  form.setValue("etapaDoCiclo", "");
  form.setValue("areasConhecimento", []);
  form.setValue("componenteIds", []);
  form.setValue("unidadesOcupacionais", []);
  form.setValue("eixosFuncionais", []);
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

  const organizacoesFiltradas = referencia.organizacoes.filter((o) => o.ofertaId === ofertaId);
  const matrizesFiltradas = referencia.matrizes.filter((m) => m.ofertaId === ofertaId);

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
              <Select value={field.value} onValueChange={field.onChange} disabled={!ofertaId}>
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
                      {organizacao.nome}
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
          name="matrizCurricularId"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Matriz curricular vinculada</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={!ofertaId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={ofertaId ? "Selecione…" : "Selecione a oferta primeiro"}
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
      </div>
    </Card>
  );
}
