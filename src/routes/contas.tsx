import { createFileRoute } from "@tanstack/react-router";
import { Contas } from "../pages/Contas";

export const Route = createFileRoute("/contas")({
  head: () => ({
    meta: [
      { title: "Contas — Mordomo" },
      { name: "description", content: "Saldos por conta, bens e investimentos e patrimônio líquido." },
      { property: "og:title", content: "Contas — Mordomo" },
      { property: "og:description", content: "Saldos por conta, bens e investimentos e patrimônio líquido." },
    ],
  }),
  component: ContasPage,
});

function ContasPage() {
  return <Contas />;
}
