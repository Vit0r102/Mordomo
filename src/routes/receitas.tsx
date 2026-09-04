import { createFileRoute } from "@tanstack/react-router";
import { Lancamentos } from "../pages/Lancamentos";

export const Route = createFileRoute("/receitas")({
  head: () => ({
    meta: [
      { title: "Receitas — Mordomo" },
      { name: "description", content: "Cadastre e acompanhe todas as suas entradas do mês com categorias e contas." },
      { property: "og:title", content: "Receitas — Mordomo" },
      { property: "og:description", content: "Cadastre e acompanhe todas as suas entradas do mês com categorias e contas." },
    ],
  }),
  component: LancamentosPage,
});

function LancamentosPage() {
  return <Lancamentos tipo="receita" />;
}
