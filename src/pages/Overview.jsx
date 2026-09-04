import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Wallet, Landmark, Leaf } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, StatCard, Progress, EmptyState, Badge } from "../components/mordomo/ui";
import { useMordomo } from "../hooks/useMordomo";
import { formatBRL, formatShortBRL, monthLabel, addMonths, MONTHS_SHORT } from "../utils/format";
import {
  totaisDoMes,
  variacao,
  serieFluxo,
  distribuicaoDespesas,
  contasAPagar,
  proximosCompromissos,
  resumoPlanejamento,
  patrimonioTotal,
  resumoDividas,
} from "../services/mordomoService";

export function Overview() {
  const { state } = useMordomo();
  const ym = state.configuracoes.mesReferencia;

  const dados = useMemo(() => {
    const atual = totaisDoMes(state, ym);
    const anterior = totaisDoMes(state, addMonths(ym, -1));
    return {
      atual,
      anterior,
      fluxo: serieFluxo(state, ym, 6),
      distribuicao: distribuicaoDespesas(state, ym),
      fixos: contasAPagar(state, ym),
      compromissos: proximosCompromissos(state, ym),
      plano: resumoPlanejamento(state, ym),
      patrimonio: patrimonioTotal(state),
      dividas: resumoDividas(state),
    };
  }, [state, ym]);

  const { atual, anterior, plano } = dados;

  return (
    <>
      <div className="md-quote">
        <div>
          <span className="md-label">Mordomia</span>
          <p>
            “Cada real tem um destino. Quando você decide antes, o mês deixa de te surpreender.”
          </p>
        </div>
        <span className="md-quote-leaf">
          <Leaf size={64} strokeWidth={1} />
        </span>
      </div>

      <div className="md-grid md-grid-4">
        <StatCard
          icon={<TrendingUp size={16} />}
          tone="green"
          label="Receitas"
          value={atual.receitas}
          delta={variacao(atual.receitas, anterior.receitas)}
        />
        <StatCard
          icon={<TrendingDown size={16} />}
          tone="red"
          label="Despesas"
          value={atual.despesas}
          delta={variacao(atual.despesas, anterior.despesas)}
        />
        <StatCard
          icon={<Wallet size={16} />}
          tone="dark"
          label="Saldo do mês"
          value={atual.saldo}
          hint={`${monthLabel(ym)} · disponível após despesas`}
        />
        <StatCard
          icon={<Landmark size={16} />}
          tone="gold"
          label="Patrimônio"
          value={dados.patrimonio}
          hint={`Dívidas restantes: ${formatBRL(dados.dividas.totalRestante)}`}
        />
      </div>

      <div className="md-grid md-grid-dash">
        <Card
          title="Fluxo dos últimos 6 meses"
          action={<span className="md-mute-xs">Receitas × Despesas</span>}
        >
          <div style={{ height: 232 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dados.fluxo} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4c8c6b" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4c8c6b" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradDes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c46a52" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#c46a52" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e8e6df" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8c938d" }} />
                <YAxis
                  tickFormatter={formatShortBRL}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#8c938d" }}
                />
                <Tooltip formatter={(v) => formatBRL(v)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="receitas"
                  name="Receitas"
                  stroke="#2f6b4f"
                  strokeWidth={2}
                  fill="url(#gradRec)"
                />
                <Area
                  type="monotone"
                  dataKey="despesas"
                  name="Despesas"
                  stroke="#b4553f"
                  strokeWidth={2}
                  fill="url(#gradDes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Distribuição das despesas">
          {dados.distribuicao.length === 0 ? (
            <EmptyState title="Sem despesas no mês" message="Assim que houver lançamentos, a distribuição aparece aqui." />
          ) : (
            <>
              <div style={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dados.distribuicao}
                      dataKey="valor"
                      nameKey="nome"
                      innerRadius={44}
                      outerRadius={68}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {dados.distribuicao.map((d) => (
                        <Cell key={d.categoriaId} fill={d.cor} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatBRL(v)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="md-list">
                {dados.distribuicao.slice(0, 5).map((d) => (
                  <div className="md-list-row" key={d.categoriaId}>
                    <span className="md-dot" style={{ background: d.cor }} />
                    <div className="md-list-main">
                      <strong>{d.nome}</strong>
                      <span className="md-mute-xs">{d.percentual.toFixed(1)}% do mês</span>
                    </div>
                    <span className="md-list-amount">{formatBRL(d.valor)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card title="Contas a pagar" action={<Link to="/planejamento" className="md-mute-xs">Planejar</Link>}>
          {dados.fixos.length === 0 ? (
            <EmptyState title="Nada previsto" message="Cadastre suas contas fixas no planejamento." />
          ) : (
            <div className="md-list">
              {dados.fixos.map((f) => (
                <div className="md-list-row" key={f.id}>
                  <span className="md-daychip">
                    <b>{String(f.diaVencimento).padStart(2, "0")}</b>
                    <span>{MONTHS_SHORT[Number(ym.slice(5, 7)) - 1]}</span>
                  </span>
                  <div className="md-list-main">
                    <strong>{f.nome}</strong>
                    <span className="md-mute-xs">{f.pago ? "Pago neste mês" : "Aguardando pagamento"}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="md-list-amount">{formatBRL(f.valor)}</div>
                    <Badge tone={f.pago ? "green" : "gold"}>{f.pago ? "Pago" : "Pendente"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="md-grid md-grid-bottom">
        <Card title="Planejado × Realizado" action={<Link to="/planejamento" className="md-mute-xs">Ver planejamento</Link>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span className="md-mute-xs">Realizado sobre o planejado</span>
                <span style={{ fontWeight: 600 }}>{plano.percentualRealizado.toFixed(0)}%</span>
              </div>
              <Progress value={plano.percentualRealizado} />
            </div>
            <div className="md-list">
              <div className="md-list-row">
                <div className="md-list-main">
                  <strong>Planejado</strong>
                </div>
                <span className="md-list-amount">{formatBRL(plano.planejado)}</span>
              </div>
              <div className="md-list-row">
                <div className="md-list-main">
                  <strong>Realizado</strong>
                </div>
                <span className="md-list-amount">{formatBRL(plano.realizado)}</span>
              </div>
              <div className="md-list-row">
                <div className="md-list-main">
                  <strong>Disponível conforme o plano</strong>
                </div>
                <span className={`md-list-amount ${plano.disponivelPlanejado >= 0 ? "md-pos" : "md-neg"}`}>
                  {formatBRL(plano.disponivelPlanejado)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Próximos compromissos" action={<Link to="/calendario" className="md-mute-xs">Calendário</Link>}>
          {dados.compromissos.length === 0 ? (
            <EmptyState title="Nenhum compromisso" message="Defina planejamentos para ver os compromissos do mês." />
          ) : (
            <div className="md-list">
              {dados.compromissos.map((c) => (
                <div className="md-list-row" key={c.id}>
                  <span className="md-daychip">
                    <b>{c.data.slice(8, 10)}</b>
                    <span>{MONTHS_SHORT[Number(c.data.slice(5, 7)) - 1]}</span>
                  </span>
                  <div className="md-list-main">
                    <strong>{c.nome}</strong>
                    <span className="md-mute-xs">Compromisso planejado</span>
                  </div>
                  <span className="md-list-amount">{formatBRL(c.valor)}</span>
                </div>
              ))}
              <div className="md-list-total">
                <span>Total previsto</span>
                <span>{formatBRL(dados.compromissos.reduce((a, c) => a + c.valor, 0))}</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
