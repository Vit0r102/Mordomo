import { createFileRoute } from "@tanstack/react-router";
import { Configuracoes } from "../pages/Configuracoes";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Mordomo" },
      { name: "description", content: "Perfil, versículo, percentual do dízimo, meta de economia e dados." },
      { property: "og:title", content: "Configurações — Mordomo" },
      { property: "og:description", content: "Perfil, versículo, percentual do dízimo, meta de economia e dados." },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  return <Configuracoes />;
}
