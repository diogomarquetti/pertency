import type { Control } from "react-hook-form";

import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import type { PerfilFuncionalValues } from "@/app/(app)/estudantes/perfil-funcional-schema";

export function AlertasCard({ control }: { control: Control<PerfilFuncionalValues> }) {
  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">3.</span> Alertas para a equipe
      </h2>

      <FormField
        control={control}
        name="situacoesAtencao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Situações que exigem atenção <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Situações objetivas que podem afetar participação, segurança ou bem-estar…"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="oQueAjuda"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              O que ajuda o estudante <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Estratégias, recursos e formas de acolhimento que funcionam no ambiente escolar…"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="segurancaCuidados"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Segurança e cuidados importantes <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Somente informações relevantes à proteção e ao cotidiano escolar…"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
}
