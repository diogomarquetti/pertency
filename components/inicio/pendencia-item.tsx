"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Info,
  Presentation,
  User,
  UserCog,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Origem, Pendencia, Severidade } from "@/lib/pendencias/types";

const ORIGEM: Record<Origem, { icone: LucideIcon; label: string }> = {
  estudante: { icone: User, label: "Estudante" },
  avaliacao: { icone: ClipboardCheck, label: "Avaliação de Ingresso" },
  documentos: { icone: FileText, label: "Documentos" },
  turma: { icone: Presentation, label: "Turma" },
  usuario: { icone: UserCog, label: "Usuários" },
  configuracao: { icone: Building2, label: "Configuração" },
};

const ICONE_SEVERIDADE: Record<Severidade, string> = {
  atrasada: "bg-danger-tint text-danger",
  atencao: "bg-warning-tint text-warning",
  normal: "bg-brand-tint text-blue-700",
};

/**
 * Um item da homepage. O card inteiro leva ao destino: o link do título
 * cobre o item com um ::after, e "Por que estou vendo isto?" fica por cima
 * (relative z-10) para abrir a regra sem navegar. Em "resolver", a cor do
 * ícone indica a severidade e só "Atrasada" ganha selo; em "acompanhar",
 * ícone neutro e quem resolve.
 */
export function PendenciaItem({
  pendencia,
  variante,
}: {
  pendencia: Pendencia;
  variante: "resolver" | "acompanhar";
}) {
  const [regraAberta, setRegraAberta] = useState(false);
  const regraId = useId();
  const origem = ORIGEM[pendencia.origem];
  const Icone = origem.icone;
  const resolver = variante === "resolver";

  return (
    <li className="group relative grid grid-cols-[36px_minmax(0,1fr)_auto] gap-x-[12px] border-t border-line px-3 py-2 transition-colors duration-base ease-standard hover:bg-neutral-100 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:gap-x-[14px]">
      <div
        className={cn(
          "flex size-[36px] items-center justify-center rounded-sm sm:size-[40px]",
          resolver ? ICONE_SEVERIDADE[pendencia.severidade] : "bg-bg text-muted",
        )}
      >
        <Icone size={18} strokeWidth={2} aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-1 gap-y-[6px]">
          <h3 className="text-[15px] leading-[1.35] font-semibold text-ink">
            <Link
              href={pendencia.destino}
              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-brand focus-visible:after:ring-inset"
            >
              {pendencia.titulo} ·{" "}
              <span className="text-blue-700 underline-offset-[3px] group-hover:underline">{pendencia.sujeito}</span>
              {resolver && <span className="sr-only"> — {pendencia.acao}</span>}
            </Link>
          </h3>
          {resolver && pendencia.severidade === "atrasada" && <Badge variant="danger">Atrasada</Badge>}
        </div>

        <p className="mt-[4px] text-[14px] leading-[1.55] text-ink">{pendencia.descricao}</p>

        <div className="mt-1 flex flex-wrap items-center gap-x-[14px] gap-y-[6px] text-caption text-muted">
          {resolver ? (
            <>
              <span>
                {origem.label} · {pendencia.estado}
              </span>
              <span>{pendencia.tempo}</span>
            </>
          ) : (
            <span>
              Quem resolve: <strong className="font-semibold text-ink">{pendencia.quemResolve}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={() => setRegraAberta((aberta) => !aberta)}
            aria-expanded={regraAberta}
            aria-controls={regraId}
            className="relative z-10 inline-flex items-center gap-[4px] rounded-xs text-blue-700 hover:underline"
          >
            <Info size={14} strokeWidth={2} aria-hidden="true" />
            Por que estou vendo isto?
          </button>
        </div>

        <div
          id={regraId}
          hidden={!regraAberta}
          className="relative z-10 mt-[10px] cursor-auto rounded-sm border border-line bg-bg px-[12px] py-[10px] text-[13px] text-ink"
        >
          Regra: {pendencia.regra}
          {pendencia.provisorio && (
            <span className="ml-[6px] inline-block text-caption font-bold tracking-[0.04em] text-warning">
              PROVISÓRIO · validar prazo com P.O
            </span>
          )}
        </div>
      </div>

      <ChevronRight
        size={18}
        strokeWidth={2}
        aria-hidden="true"
        className="self-center text-muted transition-[color,transform] duration-base ease-standard group-hover:translate-x-[2px] group-hover:text-brand"
      />
    </li>
  );
}
