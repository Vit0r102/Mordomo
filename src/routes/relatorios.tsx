import { createFileRoute } from "@tanstack/react-router";
import { Relatorios } from "../pages/Relatorios";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Mordomo" },
      { name: "description", content: "Fluxo de caixa, distribuição por categoria e evolução do saldo." },
      { property: "og:title", content: "Relatórios — Mordomo" },
      { property: "og:description", content: "Fluxo de caixa, distribuição por categoria e evolução do saldo." },
    ],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  return <Relatorios />;
}
