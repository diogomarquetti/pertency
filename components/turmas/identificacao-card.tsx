import type { Control } from "react-hook-form";

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

import { STATUS_OPTIONS, type UpdateTurmaValues } from "@/app/(app)/turmas/schema";
import type { ReferenciaTurmaForm } from "@/app/(app)/turmas/queries";

export function IdentificacaoCard({
  control,
  referencia,
}: {
  control: Control<UpdateTurmaValues>;
  referencia: ReferenciaTurmaForm;
}) {
  return (
    <Card className="gap-4 p-[24px]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-baseline gap-2 text-highlight text-ink">
          <span className="text-brand">1.</span> Identificação da turma
        </h2>
        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
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
          control={control}
          name="nome"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Nome da turma</FormLabel>
              <FormControl>
                <Input placeholder="Ex.: Girassóis, Trilhas 4º ano…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="anoLetivoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano letivo</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano letivo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {referencia.anosLetivos.map((ano) => (
                    <SelectItem key={ano.id} value={ano.id}>
                      {ano.ano}
                      {ano.status === "planejado" ? " (planejado)" : ""}
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
          name="turnoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turno</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {referencia.turnos.map((turno) => (
                    <SelectItem key={turno.id} value={turno.id}>
                      {turno.nome}
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
          name="capacidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Capacidade de estudantes <span className="font-normal text-muted">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="Ex.: 8" {...field} />
              </FormControl>
              <p className="text-[12.5px] text-muted">
                Usada como alerta de gestão, não bloqueia o cadastro.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
}
