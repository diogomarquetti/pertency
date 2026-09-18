import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

/**
 * Cartão neutro pra sinalizar um módulo ainda não implementado — pensado
 * pra se repetir em outras telas além do Perfil do Estudante (Turma,
 * Planejamento etc.), por isso vive em components/ui em vez de
 * components/estudantes.
 */
export function FutureModuleCard({
  icon: Icon,
  titulo,
  descricao,
}: {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
}) {
  return (
    <Card className="gap-3 p-[24px]">
      <div className="flex items-center gap-3">
        <div className="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-bg text-muted">
          <Icon size={18} strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-[14.5px] font-semibold text-ink">{titulo}</h3>
          <Badge variant="neutral" dot={false}>
            Em breve
          </Badge>
        </div>
      </div>
      <p className="text-[13px] leading-relaxed text-muted">{descricao}</p>
    </Card>
  );
}
