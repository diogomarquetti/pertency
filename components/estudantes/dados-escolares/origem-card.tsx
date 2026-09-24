"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";

import {
  FORMA_ORIGEM_OPTIONS,
  formaOrigemTemDetalhes,
  type DadosEscolaresValues,
} from "@/app/(app)/estudantes/dados-escolares-schema";

/**
 * Forma de origem decide o resto do bloco: "Primeira matrícula escolar" (ou
 * nada selecionado ainda) esconde Rede/Escola de origem e Informações sobre
 * a transferência — a Server Action limpa esses campos ao salvar.
 */
export function OrigemCard({ form }: { form: UseFormReturn<DadosEscolaresValues> }) {
  const formaOrigem = useWatch({ control: form.control, name: "formaOrigem" });
  const mostrarDetalhes = formaOrigemTemDetalhes(formaOrigem);

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">2.</span> Origem escolar
      </h2>

      <FormField
        control={form.control}
        name="formaOrigem"
        render={({ field }) => (
          <FormItem className="sm:w-[calc(50%-10px)]">
            <FormLabel>Forma de origem</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {FORMA_ORIGEM_OPTIONS.map((opcao) => (
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

      {mostrarDetalhes && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="redeOrigem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Rede de origem <span className="font-normal text-muted">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="escolaOrigem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Escola de origem <span className="font-normal text-muted">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="historicoTransferencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Informações sobre a transferência{" "}
                  <span className="font-normal text-muted">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea rows={3} className="min-h-0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </Card>
  );
}
