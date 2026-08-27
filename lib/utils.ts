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
