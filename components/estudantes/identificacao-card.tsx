"use client";

import type { UseFormReturn } from "react-hook-form";

import { Card } from "@/components/ui/card";
import { CpfInput } from "@/components/ui/cpf-input";
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

import {
  COR_RACA_OPTIONS,
  SEXO_OPTIONS,
  SITUACAO_OPTIONS,
  TIPO_DOCUMENTO_OPTIONS,
  calcularIdade,
  type UpdateEstudanteValues,
} from "@/app/(app)/estudantes/schema";

export function IdentificacaoCard({ form }: { form: UseFormReturn<UpdateEstudanteValues> }) {
  const dataNascimento = form.watch("dataNascimento");
  const idade = calcularIdade(dataNascimento);
  const tipoDocumento = form.watch("tipoDocumentoIdentificacao");

  return (
    <Card className="gap-4 p-[24px]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-baseline gap-2 text-highlight text-ink">
          <span className="text-brand">1.</span> Identificação
        </h2>
        <FormField
          control={form.control}
          name="situacao"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-[220px]">
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
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="nomeCompleto"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do estudante" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nomeSocial"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                Nome social <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Quando houver" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataNascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de nascimento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Idade</FormLabel>
          <div className="flex h-[42px] items-center rounded-sm border-[1.5px] border-line bg-bg px-[14px] text-control text-muted">
            {idade !== null ? `${idade} ano${idade === 1 ? "" : "s"}` : "—"}
          </div>
        </FormItem>

        <FormField
          control={form.control}
          name="sexo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexo</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SEXO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="corRaca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor/raça</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COR_RACA_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="nacionalidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nacionalidade</FormLabel>
              <FormControl>
                <Input placeholder="Ex.: Brasileira" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="naturalidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Naturalidade</FormLabel>
              <FormControl>
                <Input placeholder="Cidade/UF de nascimento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <CpfInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipoDocumentoIdentificacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de documento de identificação</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value !== "rg") {
                    form.setValue("orgaoEmissorUf", "");
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIPO_DOCUMENTO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="numeroDocumento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do documento</FormLabel>
              <FormControl>
                <Input placeholder="Número do documento selecionado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {tipoDocumento === "rg" && (
          <FormField
            control={form.control}
            name="orgaoEmissorUf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Órgão emissor/UF</FormLabel>
                <FormControl>
                  <Input placeholder="Ex.: SSP/PR" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </Card>
  );
}
