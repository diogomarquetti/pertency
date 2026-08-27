"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { EscolaAtual, MantenedoraAtual } from "@/app/(app)/minha-escola/queries";

import { EscolaTab } from "./escola-tab";
import { MantenedoraTab } from "./mantenedora-tab";

const TAB_LABELS: Record<string, string> = {
  escola: "Escola",
  mantenedora: "Mantenedora",
  turmas: "Turmas",
};

function EmBreve({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-line bg-surface px-[24px] py-[64px] text-center">
      <div className="flex size-[52px] items-center justify-center rounded-full bg-brand-tint text-brand">
        <Building2 size={22} strokeWidth={2} aria-hidden="true" />
      </div>
      <h2 className="text-highlight text-ink">{titulo}</h2>
      <p className="max-w-[320px] text-[13px] leading-relaxed text-muted">
        Essa aba ainda não foi implementada — em breve.
      </p>
    </div>
  );
}

export function MinhaEscolaTabs({
  escola,
  mantenedora,
}: {
  escola: EscolaAtual;
  mantenedora: MantenedoraAtual | null;
}) {
  const [activeTab, setActiveTab] = useState("escola");

  return (
    <>
      <PageTitle
        value="Minha Escola"
        breadcrumb={[
          { label: "Minha Escola", href: "/minha-escola" },
          { label: TAB_LABELS[activeTab] },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-[24px]">
          <TabsTrigger value="escola">Escola</TabsTrigger>
          <TabsTrigger value="mantenedora">Mantenedora</TabsTrigger>
          <TabsTrigger value="turmas">Turmas</TabsTrigger>
        </TabsList>

        <TabsContent value="escola">
          <EscolaTab escola={escola} />
        </TabsContent>
        <TabsContent value="mantenedora">
          <MantenedoraTab mantenedora={mantenedora} />
        </TabsContent>
        <TabsContent value="turmas">
          <EmBreve titulo="Turmas" />
        </TabsContent>
      </Tabs>
    </>
  );
}
