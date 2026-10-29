import { useEffect } from "react";

/**
 * Select obrigatório com uma só opção já vem com ela escolhida. Roda em
 * efeito (e não no onValueChange do campo de que ele depende) pra opção já
 * estar renderizada no select — senão o Radix devolve "" e desfaz a escolha.
 * `ativo: false` em formulário só leitura, pra não alterar o que está salvo.
 */
export function useSelecaoUnica(
  valorAtual: string | null | undefined,
  opcoes: readonly { id: string }[],
  selecionar: (id: string) => void,
  ativo = true,
) {
  const unica = opcoes.length === 1 ? opcoes[0].id : null;

  useEffect(() => {
    if (ativo && !valorAtual && unica) {
      selecionar(unica);
    }
    // `selecionar` costuma ser recriado a cada render; o que importa é a opção.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, valorAtual, unica]);
}
