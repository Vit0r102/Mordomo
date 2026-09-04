import { createFileRoute } from "@tanstack/react-router";
import { Planejamento } from "../pages/Planejamento";

export const Route = createFileRoute("/planejamento")({
  head: () => ({
    meta: [
      { title: "Planejamento — Mordomo" },
      { name: "description", content: "Defina limites por categoria e compare o planejado com o realizado." },
      { property: "og:title", content: "Planejamento — Mordomo" },
      { property: "og:description", content: "Defina limites por categoria e compare o planejado com o realizado." },
    ],
  }),
  component: PlanejamentoPage,
});

function PlanejamentoPage() {
  return <Planejamento />;
}
