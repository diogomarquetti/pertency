import { useWatch, type Control } from "react-hook-form";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  AREA_APOIO_OPTIONS,
  ENCAMINHAMENTO_OPTIONS,
  NIVEL_APOIO_OPTIONS,
  RECOMENDACAO_OPTIONS,
  decisaoFinalLiberada,
  type AvaliacaoValues,
} from "@/app/(app)/estudantes/avaliacao-schema";

function toggleValue(current: string[], value: string) {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

export function AvaliacaoParecerCard({ control }: { control: Control<AvaliacaoValues> }) {
  // A decisão final (elegibilidade, justificativa, encaminhamento) só abre
  // com o status "Concluída" — reage ao select do bloco 1, não ao valor
  // salvo, pra dar pra concluir e decidir no mesmo salvamento. Se a
  // avaliação for reaberta, os valores continuam guardados, só travados.
  const statusAvaliacao = useWatch({ control, name: "statusAvaliacao" });
  const decisaoBloqueada = !decisaoFinalLiberada(statusAvaliacao);

  return (
    <Card className="gap-4 p-[24px]">
      <h2 className="flex items-baseline gap-2 text-highlight text-ink">
        <span className="text-brand">5.</span> Necessidades e parecer
      </h2>

      <FormField
        control={control}
        name="necessidadesEspecificas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Necessidades educacionais específicas</FormLabel>
            <FormControl>
              <Textarea placeholder="Comunicação, mediação, adaptação, rotina, autocuidado…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="nivelApoio"
        render={({ field }) => (
          <FormItem className="sm:w-[280px]">
            <FormLabel>Nível de apoio requerido</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {NIVEL_APOIO_OPTIONS.map((nivel) => (
                  <SelectItem key={nivel.value} value={nivel.value}>
                    {nivel.label}
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
        name="areasApoio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Áreas de apoio</FormLabel>
            <div className="rounded-sm border border-line px-[10px]">
              {AREA_APOIO_OPTIONS.map((area, index) => (
                <label
                  key={area}
                  className={cn(
                    "flex cursor-pointer items-center gap-[10px] py-[9px] text-[14px] text-ink",
                    index > 0 && "border-t border-line",
                  )}
                >
                  <Checkbox
                    checked={field.value.includes(area)}
                    onCheckedChange={() => field.onChange(toggleValue(field.value, area))}
                  />
                  {area}
                </label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="parecerEquipe"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Análise integrada e parecer da equipe</FormLabel>
            <FormControl>
              <Textarea placeholder="Síntese conclusiva da avaliação…" {...field} />
            </FormControl>
            <p className="text-[12.5px] text-muted">
              Contemple perfil de desenvolvimento, potencialidades, dificuldades funcionais,
              implicações pedagógicas e justificativa do apoio, quando aplicável.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="recomendacaoElegibilidade"
        render={({ field }) => (
          <FormItem className="rounded-md border border-line bg-bg p-[16px]">
            <FormLabel>Recomendação de elegibilidade</FormLabel>
            {decisaoBloqueada && (
              <p className="flex items-center gap-[6px] text-[12.5px] text-muted">
                <Lock size={12} strokeWidth={2} aria-hidden="true" />
                Disponível quando o status da avaliação for &ldquo;Concluída&rdquo;.
              </p>
            )}
            <Select value={field.value} onValueChange={field.onChange} disabled={decisaoBloqueada}>
              <FormControl>
                <SelectTrigger className="sm:w-[240px]">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {RECOMENDACAO_OPTIONS.map((recomendacao) => (
                  <SelectItem key={recomendacao.value} value={recomendacao.value}>
                    {recomendacao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[12.5px] text-muted">
              &ldquo;Não elegível&rdquo; atualiza automaticamente a situação do estudante na Aba
              1. &ldquo;Elegível&rdquo; libera Documentos e Dados escolares.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="justificativaElegibilidade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Justificativa</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Baseada no conjunto de evidências reunidas na avaliação…"
                {...field}
                disabled={decisaoBloqueada}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="encaminhamentoRecomendado"
        render={({ field }) => (
          <FormItem className="sm:w-[280px]">
            <FormLabel>
              Encaminhamento recomendado <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <Select value={field.value} onValueChange={field.onChange} disabled={decisaoBloqueada}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ENCAMINHAMENTO_OPTIONS.map((opcao) => (
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

      <FormField
        control={control}
        name="orientacoesPai"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Orientações iniciais para o PAI</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Estratégias de comunicação, mediação, adaptações, recursos, prioridades de aprendizagem…"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="assinaturas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Assinaturas <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Responsáveis pela avaliação" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
}
