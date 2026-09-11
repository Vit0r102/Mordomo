import { createFileRoute } from "@tanstack/react-router";
import { ComoUsar } from "../pages/ComoUsar";

export const Route = createFileRoute("/como-usar")({
  head: () => ({
    meta: [
      { title: "Mordomo — Como usar" },
      {
        name: "description",
        content:
          "Tutorial do Mordomo: aprenda a usar receitas, despesas, planejamento, recebimentos futuros, calendário e relatórios.",
      },
      { property: "og:title", content: "Mordomo — Como usar" },
      {
        property: "og:description",
        content: "Guia passo a passo para aproveitar cada seção do Mordomo.",
      },
    ],
  }),
  component: ComoUsar,
});
