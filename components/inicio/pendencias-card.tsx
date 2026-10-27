import { CircleCheck } from "lucide-react";

import { Card } from "@/components/ui/card";

/**
 * Card de um dos dois blocos da homepage ("Para você resolver" /
 * "Acompanhar"). Os itens chegam como `children` (um <li> por pendência);
 * sem itens, mostra o estado vazio positivo.
 */
export function PendenciasCard({
  titulo,
  dica,
  total,
  vazio,
  children,
}: {
  titulo: string;
  dica: string;
  total: number;
  vazio: { titulo: string; texto: string };
  children?: React.ReactNode;
}) {
  const tituloId = `pendencias-${titulo.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <Card role="region" className="gap-0 py-0 shadow-sm" aria-labelledby={tituloId}>
      <header className="flex items-baseline gap-[10px] px-3 pt-[20px] pb-2">
        <h2 id={tituloId} className="text-highlight text-ink">
          {titulo}
        </h2>
        {total > 0 && <span className="text-caption text-muted">{total}</span>}
        <span className="ml-auto hidden text-caption text-muted sm:inline">{dica}</span>
      </header>

      <ul className="flex flex-col">
        {total > 0 ? (
          children
        ) : (
          <li className="flex items-center gap-2 border-t border-line px-3 py-[20px]">
            <div className="flex size-[40px] shrink-0 items-center justify-center rounded-sm bg-success-tint text-success">
              <CircleCheck size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-ink">{vazio.titulo}</p>
              <p className="text-[14px] text-muted">{vazio.texto}</p>
            </div>
          </li>
        )}
      </ul>
    </Card>
  );
}
