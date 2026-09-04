import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "../pages/Overview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mordomo — Visão Geral das suas finanças" },
      {
        name: "description",
        content:
          "Painel da sua mordomia: receitas, despesas, saldo, patrimônio e compromissos do mês em um só lugar.",
      },
      { property: "og:title", content: "Mordomo — Visão Geral das suas finanças" },
      {
        property: "og:description",
        content: "Gestão financeira pessoal com clareza, planejamento e propósito.",
      },
    ],
  }),
  component: Overview,
});
