import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fallback de navegação (os `loading.tsx` reexportam este componente). O
 * shell — menu e topbar — continua na tela; só o conteúdo da página vira
 * esqueleto até o servidor terminar de renderizar a próxima. Sem isso o
 * clique parece não responder: o Next segura a página antiga até a nova
 * chegar inteira.
 */
export default function PageLoading() {
  return (
    <div role="status" aria-label="Carregando">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Skeleton className="h-[var(--space-5)] w-full sm:w-[340px]" />
        <Skeleton className="h-[var(--space-5)] w-full sm:w-[220px]" />
      </div>
      <Card className="gap-0 py-0">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-[10px] border-b border-line px-3 py-2 last:border-b-0">
            <Skeleton className="size-[32px] shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
              <Skeleton className="h-[12px] w-1/3" />
              <Skeleton className="h-[10px] w-1/5" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
