import { createFileRoute } from "@tanstack/react-router";
import { Historico } from "../pages/Historico";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — Mordomo" },
      { name: "description", content: "Pesquise e filtre todos os lançamentos por tipo, categoria e mês." },
      { property: "og:title", content: "Histórico — Mordomo" },
      { property: "og:description", content: "Pesquise e filtre todos os lançamentos por tipo, categoria e mês." },
    ],
  }),
  component: HistoricoPage,
});

function HistoricoPage() {
  return <Historico />;
}
