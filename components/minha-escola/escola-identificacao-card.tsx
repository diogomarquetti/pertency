import type { Control } from "react-hook-form";
import { AlertTriangle } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  MODALIDADE_OPTIONS,
  STATUS_OPTIONS,
  TIPO_ESCOLA_OPTIONS,
  type EscolaValues,
} from "@/app/(app)/minha-escola/schema";

export function EscolaIdentificacaoCard({
  control,
  statusAtual,
}: {
  control: Control<EscolaValues>;
  statusAtual: "ativa" | "inativa";
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-baseline gap-2 text-highlight text-ink">
          <span className="text-brand">1.</span> Identificação
        </h2>
        <Badge variant={statusAtual === "ativa" ? "success" : "neutral"}>
          {statusAtual === "ativa" ? "Ativa" : "Inativa"}
        </Badge>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="nomeOficial"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Nome oficial</FormLabel>
              <FormControl>
                <Input placeholder="Nome oficial da escola" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="nomeUsual"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nome usual <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Como a escola é conhecida" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="codigoEscola"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Código da escola <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Código INEP ou interno" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tipoEscola"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de escola</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIPO_ESCOLA_OPTIONS.map((option) => (
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
          name="modalidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalidade</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a modalidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MODALIDADE_OPTIONS.map((option) => (
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
          name="nreReferencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NRE vinculado</FormLabel>
              <FormControl>
                <Input placeholder="Núcleo Regional de Educação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
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

      {statusAtual === "inativa" && (
        <div className="flex gap-[10px] rounded-md bg-warning-tint px-[14px] py-[12px] text-warning-ink">
          <AlertTriangle
            size={15}
            strokeWidth={2}
            className="mt-[1px] shrink-0 text-warning"
            aria-hidden="true"
          />
          <p className="text-[13px] leading-relaxed">
            Escolas inativas não devem permitir novos cadastros operacionais (usuários, turmas,
            matrículas). Essa regra ainda não é aplicada automaticamente pelo sistema.
          </p>
        </div>
      )}
    </Card>
  );
}
