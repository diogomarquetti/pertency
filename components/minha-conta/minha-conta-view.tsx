"use client";

import { useState } from "react";

import type { MeuPerfil } from "@/app/(app)/minha-conta/queries";
import type { MinhaContaValues } from "@/app/(app)/minha-conta/schema";

import { DadosDrawer } from "./dados-drawer";
import { PerfilCard } from "./perfil-card";
import { SenhaDrawer } from "./senha-drawer";

export function MinhaContaView({ perfil }: { perfil: MeuPerfil }) {
  const [perfilAtual, setPerfilAtual] = useState(perfil);
  const [dadosOpen, setDadosOpen] = useState(false);
  const [senhaOpen, setSenhaOpen] = useState(false);

  function handleDadosSalvos(values: MinhaContaValues) {
    setPerfilAtual((atual) => ({ ...atual, ...values }));
  }

  return (
    <>
      <PerfilCard
        perfil={perfilAtual}
        onEditarDados={() => setDadosOpen(true)}
        onRedefinirSenha={() => setSenhaOpen(true)}
      />

      <DadosDrawer
        open={dadosOpen}
        onOpenChange={setDadosOpen}
        defaultValues={{
          nomeCompleto: perfilAtual.nomeCompleto,
          email: perfilAtual.email,
          telefone: perfilAtual.telefone,
        }}
        onSaved={handleDadosSalvos}
      />

      <SenhaDrawer open={senhaOpen} onOpenChange={setSenhaOpen} />
    </>
  );
}
