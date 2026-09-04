import { createFileRoute } from "@tanstack/react-router";
import { Lancamentos } from "../pages/Lancamentos";

export const Route = createFileRoute("/despesas")({
  head: () => ({
    meta: [
      { title: "Despesas — Mordomo" },
      { name: "description", content: "Registre e organize suas saídas por categoria, conta e tipo de dinheiro." },
      { property: "og:title", content: "Despesas — Mordomo" },
      { property: "og:description", content: "Registre e organize suas saídas por categoria, conta e tipo de dinheiro." },
    ],
  }),
  component: LancamentosPage,
});

function LancamentosPage() {
  return <Lancamentos tipo="despesa" />;
}
