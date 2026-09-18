import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Iniciais pro fallback do Avatar (spec pede 2 letras, não 1) — primeira
 * letra do primeiro e do último nome. Nome de uma palavra só usa as duas
 * primeiras letras dela, pra sempre devolver 2 caracteres.
 */
export function getInitials(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/**
 * `router.refresh()`, mas tirando o foco do elemento ativo antes — sem
 * isso, o botão de submit continua focado quando a árvore é
 * re-renderizada com os dados novos, e o navegador tenta trazê-lo de volta
 * pra vista com um scrollIntoView nativo. Como só o `<main>` deveria rolar
 * (o resto do app shell é `h-screen` fixo — components/layout/app-shell.tsx),
 * esse scroll acaba caindo no `<html>` inteiro: o header some, sobra um
 * vão vazio embaixo e a sidebar parece "subir". Use isto em todo lugar que
 * chamaria `router.refresh()` depois de salvar algo via botão.
 */
export function refreshAndBlur(router: { refresh: () => void }) {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  router.refresh();
}

export const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

/**
 * Validação de dígito verificador de CPF (algoritmo padrão), não só
 * formato — compartilhada entre qualquer schema que colete CPF (hoje:
 * Mantenedora e Cadastro de Estudante).
 */
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  function calcDigit(base: string, factor: number): number {
    let sum = 0;
    for (let i = 0; i < factor - 1; i++) {
      sum += Number(base[i]) * (factor - i);
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  }

  const digit1 = calcDigit(digits, 10);
  if (digit1 !== Number(digits[9])) return false;

  const digit2 = calcDigit(digits, 11);
  if (digit2 !== Number(digits[10])) return false;

  return true;
}
