import type { Control } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FUNCAO_OPTIONS, STATUS_OPTIONS } from "@/app/(app)/usuarios/schema";
import type { UpdateUsuarioValues } from "@/app/(app)/usuarios/schema";

export function DadosGeraisCard({
  control,
  statusAtual,
}: {
  control: Control<UpdateUsuarioValues>;
  statusAtual: "ativo" | "inativo";
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-baseline gap-2 text-highlight text-ink">
          <span className="text-brand">1.</span> Dados gerais
        </h2>
        <Badge variant={statusAtual === "ativo" ? "success" : "neutral"}>
          {statusAtual === "ativo" ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="nomeCompleto"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do profissional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="voce@instituicao.org.br" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Telefone <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <FormControl>
                <PhoneInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="funcao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função no sistema</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FUNCAO_OPTIONS.map((option) => (
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
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status do usuário</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
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
      </div>
    </Card>
  );
}
