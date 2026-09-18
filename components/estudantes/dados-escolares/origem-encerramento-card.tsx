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
import { Textarea } from "@/components/ui/textarea";

import {
  MOTIVO_ENCERRAMENTO_OPTIONS,
  type DadosEscolaresValues,
} from "@/app/(app)/estudantes/dados-escolares-schema";

export function OrigemEncerramentoCard({ form }: { form: UseFormReturn<DadosEscolaresValues> }) {
  const situacao = form.watch("situacao");
  const mostrarEncerramento = situacao === "transferido" || situacao === "desligado";

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">2.</span> Origem escolar
      </h2>

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
              Histórico de transferência <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {mostrarEncerramento && (
        <>
          <h2 className="flex items-baseline gap-2 text-highlight text-ink">
            <span className="text-brand">3.</span> Encerramento
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="dataEncerramento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de encerramento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivoEncerramento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo do encerramento</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOTIVO_ENCERRAMENTO_OPTIONS.map((opcao) => (
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
          </div>
        </>
      )}
    </Card>
  );
}
