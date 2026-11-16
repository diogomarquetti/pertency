import type { Control } from "react-hook-form";

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
  type ApoioPorArea,
  type AvaliacaoValues,
} from "@/app/(app)/estudantes/avaliacao-schema";

export function AvaliacaoParecerCard({ control }: { control: Control<AvaliacaoValues> }) {
  // id="parecer": âncora do link "Escrever parecer" da homepage.
  return (
    <Card id="parecer" className="scroll-mt-2 gap-4 p-[24px]">
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
        name="apoiosPorArea"
        render={({ field }) => {
          const apoios = field.value;
          const atualizar = (area: string, parcial: Partial<ApoioPorArea>) =>
            field.onChange(apoios.map((a) => (a.area === area ? { ...a, ...parcial } : a)));
          return (
            <FormItem>
              <FormLabel>Áreas de apoio</FormLabel>
              <p className="text-[12.5px] text-muted">
                Marque as áreas em que o estudante precisa de apoio. Para cada uma, informe o nível
                requerido e a justificativa.
              </p>
              <div className="rounded-sm border border-line px-[10px]">
                {AREA_APOIO_OPTIONS.map((area, index) => {
                  const apoio = apoios.find((a) => a.area === area);
                  return (
                    <div
                      key={area}
                      className={cn("py-[9px]", index > 0 && "border-t border-line")}
                    >
                      <label className="flex cursor-pointer items-center gap-[10px] text-[14px] text-ink">
                        <Checkbox
                          checked={!!apoio}
                          onCheckedChange={() =>
                            field.onChange(
                              apoio
                                ? apoios.filter((a) => a.area !== area)
                                : [...apoios, { area, nivel: "", justificativa: "" }],
                            )
                          }
                        />
                        {area}
                      </label>
                      {apoio && (
                        <div className="mt-2 flex flex-col gap-2 pl-[26px]">
                          <Select
                            value={apoio.nivel}
                            onValueChange={(nivel) => atualizar(area, { nivel })}
                          >
                            <SelectTrigger className="sm:w-[280px]" aria-label={`Nível de apoio — ${area}`}>
                              <SelectValue placeholder="Nível de apoio requerido…" />
                            </SelectTrigger>
                            <SelectContent>
                              {NIVEL_APOIO_OPTIONS.map((nivel) => (
                                <SelectItem key={nivel.value} value={nivel.value}>
                                  {nivel.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Textarea
                            value={apoio.justificativa}
                            onChange={(e) => atualizar(area, { justificativa: e.target.value })}
                            placeholder={`Justificativa do nível escolhido em ${area.toLowerCase()}…`}
                            aria-label={`Justificativa — ${area}`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
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
            <Select value={field.value} onValueChange={field.onChange}>
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
              Ao concluir: &ldquo;Elegível&rdquo; com encaminhamento &ldquo;Efetivar matrícula&rdquo;
              passa o estudante para &ldquo;A matricular&rdquo; e libera Documentos e Dados escolares;
              &ldquo;Não elegível&rdquo; atualiza a situação para &ldquo;Não elegível&rdquo;.
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
              Encaminhamento recomendado
            </FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
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
            <FormLabel>
              Orientações iniciais para o PAI <span className="font-normal text-muted">(opcional)</span>
            </FormLabel>
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
    </Card>
  );
}
