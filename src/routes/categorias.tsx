import { createFileRoute } from "@tanstack/react-router";
import { Categorias } from "../pages/Categorias";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — Mordomo" },
      { name: "description", content: "Organize categorias de receita e despesa e os tipos de dinheiro." },
      { property: "og:title", content: "Categorias — Mordomo" },
      { property: "og:description", content: "Organize categorias de receita e despesa e os tipos de dinheiro." },
    ],
  }),
  component: CategoriasPage,
});

function CategoriasPage() {
  return <Categorias />;
}
