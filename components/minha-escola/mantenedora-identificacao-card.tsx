import type { Control } from "react-hook-form";
import { AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CnpjInput } from "@/components/ui/cnpj-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import type { MantenedoraValues } from "@/app/(app)/minha-escola/schema";

export function MantenedoraIdentificacaoCard({
  control,
  statusAtual,
}: {
  control: Control<MantenedoraValues>;
  statusAtual: "ativa" | "inativa";
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-baseline gap-2 text-highlight text-ink">
          <span className="text-brand">1.</span> Identificação
        </h2>
        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-[8px] space-y-0">
              <FormLabel className="text-[13px] font-medium text-muted">
                {field.value === "ativa" ? "Ativa" : "Inativa"}
              </FormLabel>
              <FormControl>
                <Switch
                  checked={field.value === "ativa"}
                  onCheckedChange={(checked) => field.onChange(checked ? "ativa" : "inativa")}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="razaoSocial"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Razão social</FormLabel>
              <FormControl>
                <Input placeholder="Razão social da mantenedora" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="nomeFantasia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome fantasia</FormLabel>
              <FormControl>
                <Input placeholder="Nome fantasia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <CnpjInput value={field.value} onChange={field.onChange} />
              </FormControl>
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
            Mantenedoras inativas não devem permitir novos cadastros operacionais. Essa regra
            ainda não é aplicada automaticamente pelo sistema.
          </p>
        </div>
      )}
    </Card>
  );
}
