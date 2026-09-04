import { createFileRoute } from "@tanstack/react-router";
import { Dividas } from "../pages/Dividas";

export const Route = createFileRoute("/dividas")({
  head: () => ({
    meta: [
      { title: "Dívidas — Mordomo" },
      { name: "description", content: "Acompanhe o saldo, o percentual quitado e os pagamentos de cada dívida." },
      { property: "og:title", content: "Dívidas — Mordomo" },
      { property: "og:description", content: "Acompanhe o saldo, o percentual quitado e os pagamentos de cada dívida." },
    ],
  }),
  component: DividasPage,
});

function DividasPage() {
  return <Dividas />;
}
