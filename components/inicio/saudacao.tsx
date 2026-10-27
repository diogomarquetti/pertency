import { dataPorExtenso, saudacao } from "@/lib/pendencias/datas";

/** Topo da homepage: "Bom dia, Carla" + resumo do que depende do usuário hoje. */
export function Saudacao({
  nomeCompleto,
  totalResolver,
  totalAtrasadas,
}: {
  nomeCompleto: string;
  totalResolver: number;
  totalAtrasadas: number;
}) {
  const agora = new Date();
  const primeiroNome = nomeCompleto.trim().split(/\s+/)[0] ?? "";

  return (
    <section className="flex flex-col gap-[6px]">
      <h2 className="text-subtitle text-balance text-ink">
        {saudacao(agora)}
        {primeiroNome && `, ${primeiroNome}`}
      </h2>
      <p className="text-body text-muted">
        {dataPorExtenso(agora)}.{" "}
        {totalResolver > 0 ? (
          <>
            Você tem{" "}
            <strong className="font-semibold text-ink">
              {totalResolver} {totalResolver === 1 ? "pendência" : "pendências"}
            </strong>{" "}
            para resolver
            {totalAtrasadas > 0 && (
              <>
                ,{" "}
                <strong className="font-semibold text-danger">
                  {totalAtrasadas} {totalAtrasadas === 1 ? "atrasada" : "atrasadas"}
                </strong>
              </>
            )}
            .
          </>
        ) : (
          "Nada depende de você hoje."
        )}
      </p>
    </section>
  );
}
