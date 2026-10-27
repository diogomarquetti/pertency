import { Card } from "@/components/ui/card";

/**
 * Casca dos painéis da coluna lateral da homepage (Fila de ingresso,
 * Ocupação, Sua turma, Configuração da escola): título, contagem opcional e
 * rodapé opcional.
 */
export function PainelCard({
  titulo,
  contagem,
  rodape,
  children,
}: {
  titulo: string;
  contagem?: string;
  rodape?: React.ReactNode;
  children: React.ReactNode;
}) {
  const tituloId = `painel-${titulo.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <Card role="region" className="gap-0 py-0 shadow-sm" aria-labelledby={tituloId}>
      <header className="flex items-baseline gap-[10px] px-3 pt-[20px] pb-2">
        <h2 id={tituloId} className="text-highlight text-ink">
          {titulo}
        </h2>
        {contagem && <span className="text-caption text-muted">{contagem}</span>}
      </header>
      <div className="px-3 pb-[20px]">{children}</div>
      {rodape && (
        <div className="border-t border-line px-3 py-[12px] text-[13px] text-muted">{rodape}</div>
      )}
    </Card>
  );
}
