 import { useMemo } from "react";
import { PageHeader, Card, EmptyState, Badge } from "../components/mordomo/ui";
import { useMordomo } from "../hooks/useMordomo";
import { formatBRL, monthLabel, MONTHS } from "../utils/format";
import {
  receitasDoMes,
  despesasDoMes,
  contasAPagar,
  recebimentosPrevistosDoMes,
} from "../services/mordomoService";


const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function Calendario() {
  const { state } = useMordomo();
  const ym = state.configuracoes.mesReferencia;
  const [ano, mes] = ym.split("-").map(Number);

  const eventos = useMemo(() => {
    const mapa = new Map();
    const push = (dia, evento) => {
      const atual = mapa.get(dia) || [];
      atual.push(evento);
      mapa.set(dia, atual);
    };
    receitasDoMes(state, ym).forEach((r) =>
      push(Number(String(r.data).slice(8, 10)), { ...r, tipo: "receita" }),
    );
    despesasDoMes(state, ym).forEach((d) =>
      push(Number(String(d.data).slice(8, 10)), { ...d, tipo: "despesa" }),
    );
    (state.pagamentosFixos || []).forEach((f) =>
      push(Number(f.diaVencimento) || 1, {
        id: `fx-${f.id}`,
        descricao: f.nome,
        valor: f.valor,
        tipo: "fixo",
      }),
    );
    recebimentosPrevistosDoMes(state, ym).forEach((r) =>
      push(Number(String(r.dataPrevista).slice(8, 10)), {
        id: `rf-${r.id}`,
        descricao: `💰 ${r.descricao}`,
        valor: r.valor,
        tipo: "futuro",
      }),
    );

    return mapa;
  }, [state, ym]);

  const diasNoMes = new Date(ano, mes, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
  const celulas = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  const pendentes = contasAPagar(state, ym);

  return (
    <>
      <PageHeader
        title="Calendário"
        subtitle={`Compromissos e lançamentos de ${monthLabel(ym)}.`}
      />

      <Card title={`${MONTHS[mes - 1]} de ${ano}`}>
        <div className="md-calendar-head">
          {DIAS.map((d, i) => (
            <span key={`${d}-${i}`}>{d}</span>
          ))}
        </div>
        <div className="md-calendar">
          {celulas.map((dia, i) =>
            dia === null ? (
              <div className="md-cal-cell is-empty" key={`e-${i}`} />
            ) : (
              <div className="md-cal-cell" key={dia}>
                <span className="md-cal-day">{dia}</span>
                <div className="md-cal-events">
                  {(eventos.get(dia) || []).slice(0, 3).map((ev) => (
                    <span key={ev.id} className={`md-cal-event is-${ev.tipo}`} title={ev.descricao}>
                      {ev.descricao} · {formatBRL(ev.valor)}
                    </span>
                  ))}
                  {(eventos.get(dia) || []).length > 3 ? (
                    <span className="md-mute-xs">+{eventos.get(dia).length - 3} mais</span>
                  ) : null}
                </div>
              </div>
            ),
          )}
        </div>
      </Card>

      <Card title="Contas fixas a pagar neste mês">
        {pendentes.length ? (
          <div className="md-list">
            {pendentes.map((c) => (
              <div className="md-list-row" key={c.id}>
                <div className="md-list-main">
                  <div>
                    <strong>{c.nome}</strong>
                    <span className="md-mute-xs">Vence dia {c.diaVencimento}</span>
                  </div>
                </div>
                <div className="md-list-side">
                  <strong>{formatBRL(c.valor)}</strong>
                  <Badge tone={c.pago ? "green" : "gold"}>{c.pago ? "Pago" : "Pendente"}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Nada por aqui" message="Nenhuma conta fixa cadastrada." />
        )}
      </Card>
    </>
  );
}
