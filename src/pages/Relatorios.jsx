import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PageHeader, Card, StatCard, Tabs, EmptyState } from "../components/mordomo/ui";
import { useMordomo } from "../hooks/useMordomo";
import { formatBRL, formatShortBRL, monthLabel } from "../utils/format";
import {
  serieFluxo,
  distribuicaoDespesas,
  totaisDoMes,
  economia,
  religiosos,
} from "../services/mordomoService";

const TABS = [
  { value: "fluxo", label: "Fluxo de Caixa" },
  { value: "categorias", label: "Por Categoria" },
  { value: "evolucao", label: "Evolução" },
];

export function Relatorios() {
  const { state } = useMordomo();
  const ym = state.configuracoes.mesReferencia;
  const [tab, setTab] = useState("fluxo");

  const serie = useMemo(() => serieFluxo(state, ym, 6), [state, ym]);
  const distribuicao = useMemo(() => distribuicaoDespesas(state, ym), [state, ym]);
  const totais = totaisDoMes(state, ym);
  const poupado = economia(state, serie);
  const religio = religiosos(state, ym);
  const contribuicoes = [...religio.dizimos, ...religio.ofertas];
  const totalContribuicoes = religio.totalDizimos + religio.totalOfertas;

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle={`Análise de ${monthLabel(ym)} e dos últimos 6 meses.`}
      />

      <div className="md-grid md-grid-4">
        <StatCard tone="green" label="Receitas do mês" value={totais.receitas} />
        <StatCard tone="red" label="Despesas do mês" value={totais.despesas} />
        <StatCard tone="dark" label="Saldo do mês" value={totais.saldo} />
        <StatCard tone="gold" label="Economia (6 meses)" value={`${poupado.toFixed(1)}%`} />
      </div>

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === "fluxo" ? (
        <Card title="Receitas x Despesas">
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie} barGap={6}>
                <CartesianGrid vertical={false} stroke="#e6e1d6" />
                <XAxis dataKey="mes" stroke="#8a8f7d" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#8a8f7d"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatShortBRL}
                />
                <Tooltip formatter={(v) => formatBRL(v)} />
                <Legend />
                <Bar name="Receitas" dataKey="receitas" fill="#2f6b4f" radius={[6, 6, 0, 0]} />
                <Bar name="Despesas" dataKey="despesas" fill="#b4553f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}

      {tab === "categorias" ? (
        <div className="md-grid md-grid-2">
          <Card title="Distribuição das despesas">
            {distribuicao.length ? (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribuicao}
                      dataKey="valor"
                      nameKey="nome"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {distribuicao.map((d) => (
                        <Cell key={d.categoriaId} fill={d.cor} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatBRL(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="Sem despesas" message="Nenhuma despesa lançada neste mês." />
            )}
          </Card>

          <Card title="Detalhamento">
            <div className="md-table-wrap">
              <table className="md-table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th className="md-right">Valor</th>
                    <th className="md-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {distribuicao.map((d) => (
                    <tr key={d.categoriaId}>
                      <td>
                        <span className="md-dot" style={{ background: d.cor }} /> {d.nome}
                      </td>
                      <td className="md-right">{formatBRL(d.valor)}</td>
                      <td className="md-right">{d.percentual.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td className="md-right">{formatBRL(totais.despesas)}</td>
                    <td className="md-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "evolucao" ? (
        <div className="md-grid md-grid-2">
          <Card title="Evolução do saldo">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={serie}>
                  <CartesianGrid vertical={false} stroke="#e6e1d6" />
                  <XAxis dataKey="mes" stroke="#8a8f7d" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#8a8f7d"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatShortBRL}
                  />
                  <Tooltip formatter={(v) => formatBRL(v)} />
                  <Line
                    type="monotone"
                    dataKey="saldo"
                    stroke="#c9a15a"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#c9a15a" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Dízimos e ofertas do mês">
            {contribuicoes.length ? (
              <div className="md-table-wrap">
                <table className="md-table">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th className="md-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contribuicoes.map((c) => (
                      <tr key={c.id}>
                        <td>{c.descricao}</td>
                        <td className="md-right">{formatBRL(c.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td className="md-right">{formatBRL(totalContribuicoes)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <EmptyState
                title="Nada registrado"
                message="Registre seus dízimos e ofertas para acompanhar aqui."
              />
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
