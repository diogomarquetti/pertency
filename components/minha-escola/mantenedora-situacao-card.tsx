import type { Control } from "react-hook-form";
import { AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { STATUS_OPTIONS, type MantenedoraValues } from "@/app/(app)/minha-escola/schema";

export function MantenedoraSituacaoCard({
  control,
  statusAtual,
}: {
  control: Control<MantenedoraValues>;
  statusAtual: "ativa" | "inativa";
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">4.</span> Situação
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
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
            Mantenedoras inativas não devem permitir novos cadastros operacionais. Essa regra
            ainda não é aplicada automaticamente pelo sistema.
          </p>
        </div>
      )}
    </Card>
  );
}
