import Link from "next/link";
import { CircleAlert, CircleCheck, ChevronRight } from "lucide-react";

import type { ItemConfiguracao } from "@/lib/pendencias/paineis";

import { PainelCard } from "./painel-card";

export function PainelConfiguracao({ itens }: { itens: ItemConfiguracao[] }) {
  return (
    <PainelCard titulo="Configuração da escola">
      <ul className="flex flex-col">
        {itens.map((item) => {
          const conteudo = (
            <>
              {item.ok ? (
                <CircleCheck size={18} strokeWidth={2} className="shrink-0 text-success" aria-label="Em dia" />
              ) : (
                <CircleAlert size={18} strokeWidth={2} className="shrink-0 text-warning" aria-label="Precisa de atenção" />
              )}
              <span className="text-ink">{item.item}</span>
              <span className="ml-auto text-right text-caption text-muted">{item.estado}</span>
              {item.destino && <ChevronRight size={14} strokeWidth={2} className="shrink-0 text-muted" aria-hidden="true" />}
            </>
          );
          return (
            <li key={item.item} className="border-t border-line first:border-t-0">
              {item.destino ? (
                <Link href={item.destino} className="flex items-center gap-[10px] py-[10px] text-[14px] hover:text-brand">
                  {conteudo}
                </Link>
              ) : (
                <div className="flex items-center gap-[10px] py-[10px] text-[14px]">{conteudo}</div>
              )}
            </li>
          );
        })}
      </ul>
    </PainelCard>
  );
}
