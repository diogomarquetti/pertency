import { PageTitle } from "@/components/layout/page-title";

export default function DashboardPage() {
  return (
    <div>
      <PageTitle value="Início" />
      <p className="text-body text-muted">
        Estrutura visual base do Pertency — próximos passos: listagem de
        estudantes e planejamentos.
      </p>
    </div>
  );
}
