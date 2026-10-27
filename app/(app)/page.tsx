import { PageTitle } from "@/components/layout/page-title";
import { ColunaLateral } from "@/components/inicio/coluna-lateral";
import { PendenciaItem } from "@/components/inicio/pendencia-item";
import { PendenciasCard } from "@/components/inicio/pendencias-card";
import { Saudacao } from "@/components/inicio/saudacao";
import { getPendencias } from "@/lib/pendencias";
import { PAINEIS_POR_PERFIL } from "@/lib/pendencias/paineis";

export default async function InicioPage() {
  const pendencias = await getPendencias();

  // O layout já redireciona quem não tem sessão; sem linha em `usuarios` a
  // RLS bloqueia tudo — é falha de cadastro, não um estado de UI.
  if (!pendencias) {
    throw new Error("Usuário logado sem cadastro em usuarios.");
  }

  const { usuario, resolver, acompanhar } = pendencias;
  const temColunaLateral = PAINEIS_POR_PERFIL[usuario.perfil].length > 0;

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3">
      <PageTitle value="Início" />

      <Saudacao
        nomeCompleto={usuario.nomeCompleto}
        totalResolver={resolver.length}
        totalAtrasadas={resolver.filter((p) => p.severidade === "atrasada").length}
      />

      {/* Em telas estreitas a coluna lateral vai para baixo da principal. */}
      <div
        className={
          temColunaLateral
            ? "grid items-start gap-3 min-[1080px]:grid-cols-[minmax(0,1fr)_352px]"
            : "grid items-start gap-3"
        }
      >
        <div className="flex min-w-0 flex-col gap-3">
          <PendenciasCard
            titulo="Para você resolver"
            dica="Mais urgentes primeiro"
            total={resolver.length}
            vazio={{
              titulo: "Nenhuma pendência sua hoje",
              texto: "Quando algo depender de você, aparece aqui com o passo seguinte.",
            }}
          >
            {resolver.map((pendencia) => (
              <PendenciaItem key={pendencia.id} pendencia={pendencia} variante="resolver" />
            ))}
          </PendenciasCard>
          <PendenciasCard
            titulo="Acompanhar"
            dica="Depende de outra pessoa"
            total={acompanhar.length}
            vazio={{
              titulo: "Nada em andamento com outras pessoas",
              texto: "Os processos da escola estão em dia.",
            }}
          >
            {acompanhar.map((pendencia) => (
              <PendenciaItem key={pendencia.id} pendencia={pendencia} variante="acompanhar" />
            ))}
          </PendenciasCard>
        </div>
        <ColunaLateral perfil={usuario.perfil} usuarioId={usuario.id} />
      </div>
    </div>
  );
}
