import { createFileRoute } from "@tanstack/react-router";
import { Contribuicoes } from "../pages/Contribuicoes";

export const Route = createFileRoute("/contribuicoes")({
  head: () => ({
    meta: [
      { title: "Dízimos e Ofertas — Mordomo" },
      { name: "description", content: "Registre dízimos e ofertas com fidelidade e cálculo sugerido." },
      { property: "og:title", content: "Dízimos e Ofertas — Mordomo" },
      { property: "og:description", content: "Registre dízimos e ofertas com fidelidade e cálculo sugerido." },
    ],
  }),
  component: ContribuicoesPage,
});

function ContribuicoesPage() {
  return <Contribuicoes />;
}
