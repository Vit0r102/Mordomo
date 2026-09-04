import { createFileRoute } from "@tanstack/react-router";
import { Calendario } from "../pages/Calendario";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — Mordomo" },
      { name: "description", content: "Veja lançamentos e vencimentos distribuídos no mês." },
      { property: "og:title", content: "Calendário — Mordomo" },
      { property: "og:description", content: "Veja lançamentos e vencimentos distribuídos no mês." },
    ],
  }),
  component: CalendarioPage,
});

function CalendarioPage() {
  return <Calendario />;
}
