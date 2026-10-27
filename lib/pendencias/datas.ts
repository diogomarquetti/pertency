// Datas da homepage sempre no fuso da escola — o servidor (Vercel) roda em
// UTC, e "há N dias" / "Bom dia" não podem virar à meia-noite de Greenwich.
const FUSO = "America/Sao_Paulo";

const formatoISO = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatoHora = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "numeric", hour12: false });

const formatoExtenso = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** YYYY-MM-DD no fuso da escola. Aceita data pura (devolvida como está) ou timestamp. */
export function dataLocalISO(valor: string | Date): string {
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  return formatoISO.format(typeof valor === "string" ? new Date(valor) : valor);
}

export function hojeISO(agora: Date = new Date()): string {
  return dataLocalISO(agora);
}

/** Dias corridos entre duas datas YYYY-MM-DD (nunca negativo). */
export function diasEntre(desdeISO: string, hojeIso: string): number {
  const ms = Date.parse(`${hojeIso}T00:00:00Z`) - Date.parse(`${desdeISO}T00:00:00Z`);
  return Math.max(0, Math.round(ms / 86_400_000));
}

export function tempoDecorrido(dias: number): string {
  if (dias === 0) return "hoje";
  return dias === 1 ? "há 1 dia" : `há ${dias} dias`;
}

export function saudacao(agora: Date = new Date()): string {
  const hora = Number(formatoHora.format(agora));
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

/** "Terça-feira, 27 de outubro". */
export function dataPorExtenso(agora: Date = new Date()): string {
  const texto = formatoExtenso.format(agora);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
