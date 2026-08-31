"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type PageActions = {
  formId: string;
  pending: boolean;
  /** Navega pra outro lugar ao cancelar — uso típico em fluxos criar/editar de uma lista. */
  cancelHref?: string;
  /** Alternativa a `cancelHref` pra páginas singleton sem "lista" pra voltar — reseta o form no lugar. */
  onCancel?: () => void;
  /** Texto do botão de salvar — default "Salvar". */
  saveLabel?: string;
  /** Texto do botão de cancelar/voltar — default "Cancelar". */
  cancelLabel?: string;
  /** Esconde o botão de salvar — usado em telas de visualização sem permissão de escrita. */
  readOnly?: boolean;
  /** Form tem alterações não salvas — avisa antes de sair ao clicar Cancelar/Voltar. */
  isDirty?: boolean;
};

const PageActionsContext = createContext<PageActions | null>(null);
const PageActionsSetterContext = createContext<(actions: PageActions | null) => void>(() => {});

export function PageActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<PageActions | null>(null);

  return (
    <PageActionsSetterContext.Provider value={setActions}>
      <PageActionsContext.Provider value={actions}>{children}</PageActionsContext.Provider>
    </PageActionsSetterContext.Provider>
  );
}

/**
 * Dados (não callback) pro AppTopbar saber se/como renderizar o par
 * Cancelar/Salvar — quem faz o formulário de verdade submeter é o atributo
 * HTML `form` no botão, associando por id através da árvore inteira, sem
 * precisar de nenhuma função cruzando o contexto.
 */
export function usePageActions() {
  return useContext(PageActionsContext);
}

export function usePageActionsSetter() {
  return useContext(PageActionsSetterContext);
}
