import { useMemo, useState } from "react";
import { PageHeader, Card, EmptyState, StatCard } from "../components/mordomo/ui";
import { useMordomo } from "../hooks/useMordomo";
import { formatBRL, formatDate, monthLabel, lastMonths } from "../utils/format";
import { movimentacoes, nomeCategoria, nomeTipoDinheiro } from "../services/mordomoService";

export function Historico() {
  const { state } = useMordomo();
  const ym = state.configuracoes.mesReferencia;
  const [filtros, setFiltros] = useState({ busca: "", tipo: "todos", categoriaId: "todas", mes: ym });

  const meses = useMemo(() => lastMonths(ym, 12), [ym]);
  const lista = useMemo(() => movimentacoes(state, filtros), [state, filtros]);

  const totalReceitas = lista.filter((m) => m.tipo === "receita").reduce((a, m) => a + Number(m.valor || 0), 0);
  const totalDespesas = lista.filter((m) => m.tipo === "despesa").reduce((a, m) => a + Number(m.valor || 0), 0);

  const set = (campo) => (e) => setFiltros((prev) => ({ ...prev, [campo]: e.target.value }));

  return (
    <>
      <PageHeader title="Histórico" subtitle="Toda a sua movimentação, em um só lugar." />

      <div className="md-grid md-grid-3">
        <StatCard tone="green" icon={<span>↑</span>} label="Receitas filtradas" value={totalReceitas} />
        <StatCard tone="red" icon={<span>↓</span>} label="Despesas filtradas" value={totalDespesas} />
        <StatCard tone="dark" icon={<span>=</span>} label="Saldo filtrado" value={totalReceitas - totalDespesas} />
      </div>

      <Card title="Filtros">
        <div className="md-filters">
          <input
            className="md-input"
            placeholder="Buscar por descrição..."
            value={filtros.busca}
            onChange={set("busca")}
          />
          <select className="md-select" value={filtros.tipo} onChange={set("tipo")}>
            <option value="todos">Todos os tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
          <select className="md-select" value={filtros.categoriaId} onChange={set("categoriaId")}>
            <option value="todas">Todas as categorias</option>
            {state.categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <select className="md-select" value={filtros.mes} onChange={set("mes")}>
            <option value="todos">Todos os meses</option>
            {meses.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card title={`${lista.length} movimentação(ões)`}>
        {lista.length === 0 ? (
          <EmptyState title="Nada encontrado" message="Ajuste os filtros para ver outras movimentações." />
        ) : (
          <>
            <div className="md-table-wrap md-stack-mobile">
              <table className="md-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Tipo</th>
                    <th>Categoria</th>
                    <th>Dinheiro</th>
                    <th className="md-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((m) => (
                    <tr key={`${m.tipo}-${m.id}`}>
                      <td>{formatDate(m.data)}</td>
                      <td>{m.descricao}</td>
                      <td>{m.tipo === "receita" ? "Receita" : "Despesa"}</td>
                      <td>{nomeCategoria(state, m.categoriaId)}</td>
                      <td>{nomeTipoDinheiro(state, m.tipoDinheiroId)}</td>
                      <td className={`md-right ${m.tipo === "receita" ? "md-pos" : "md-neg"}`}>
                        {formatBRL(m.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md-mobile-cards">
              {lista.map((m) => (
                <div key={`m-${m.tipo}-${m.id}`} className="md-card md-card-quiet">
                  <div className="md-card-head" style={{ marginBottom: 6 }}>
                    <strong style={{ fontWeight: 500 }}>{m.descricao}</strong>
                    <span className={m.tipo === "receita" ? "md-pos" : "md-neg"} style={{ fontWeight: 600 }}>
                      {formatBRL(m.valor)}
                    </span>
                  </div>
                  <div className="md-mute-xs">
                    {formatDate(m.data)} · {nomeCategoria(state, m.categoriaId)} · {nomeTipoDinheiro(state, m.tipoDinheiroId)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  );
}
