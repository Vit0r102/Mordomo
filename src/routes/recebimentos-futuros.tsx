import { createFileRoute } from "@tanstack/react-router";
import { RecebimentosFuturos } from "../pages/RecebimentosFuturos";

const DESC =
  "Registre valores que você ainda vai receber e confirme a entrada apenas quando o dinheiro chegar de fato.";

export const Route = createFileRoute("/recebimentos-futuros")({
  head: () => ({
    meta: [
      { title: "Recebimentos Futuros — Mordomo" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Recebimentos Futuros — Mordomo" },
      { property: "og:description", content: DESC },
    ],
  }),
  component: RecebimentosFuturos,
});
