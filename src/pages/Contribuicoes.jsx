import { useMemo, useState } from "react";
import { HandHeart, Plus } from "lucide-react";
import { PageHeader, Card, Modal, Field, StatCard, EmptyState, Progress, useToast } from "../components/mordomo/ui";
import { useMordomo } from "../hooks/useMordomo";
import { formatBRL, formatDate, monthLabel, parseAmount, todayISO } from "../utils/format";
import { religiosos, totaisDoMes } from "../services/mordomoService";

function ContribuicaoForm({ tipo, sugestao, onSubmit, onCancel }) {
  const { state } = useMordomo();
  const [form, setForm] = useState({
    descricao: tipo === "dizimo" ? "Dízimo" : "Oferta",
    valor: sugestao ? String(Math.round(sugestao)).replace(".", ",") : "",
    data: todayISO(),
    tipoDinheiroId: state.tiposDinheiro[0]?.id || "",
    contaId: state.contas[0]?.id || "",
    observacao: "",
  });
  const set = (c) => (e) => setForm((prev) => ({ ...prev, [c]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (parseAmount(form.valor) <= 0) return;
        onSubmit({ ...form, valor: parseAmount(form.valor) });
      }}
    >
      <div className="md-form-grid">
        <Field label="Descrição" span>
          <input className="md-input" value={form.descricao} onChange={set("descricao")} />
        </Field>
        <Field label="Valor (R$)">
          <input className="md-input" value={form.valor} onChange={set("valor")} placeholder="0,00" />
        </Field>
        <Field label="Data">
          <input className="md-input" type="date" value={form.data} onChange={set("data")} />
        </Field>
        <Field label="Tipo de dinheiro">
          <select className="md-select" value={form.tipoDinheiroId} onChange={set("tipoDinheiroId")}>
            {state.tiposDinheiro.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Conta">
          <select className="md-select" value={form.contaId} onChange={set("contaId")}>
            <option value="">Sem conta</option>
            {state.contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Observação" span>
          <textarea className="md-textarea" value={form.observacao} onChange={set("observacao")} />
        </Field>
      </div>
      <div className="md-form-actions">
        <button type="button" className="md-button md-button-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="md-button md-button-primary">
          Registrar
        </button>
      </div>
    </form>
  );
}

export function Contribuicoes() {
  const mordomo = useMordomo();
  const { state } = mordomo;
  const ym = state.configuracoes.mesReferencia;
  const [modal, setModal] = useState(null);
  const [toast, showToast] = useToast();

  const dados = useMemo(() => {
    const r = religiosos(state, ym);
    const { receitas } = totaisDoMes(state, ym);
    const percentual = Number(state.configuracoes.percentualDizimo) || 10;
    const sugerido = (receitas * percentual) / 100;
    return { ...r, receitas, percentual, sugerido, cumprimento: sugerido ? (r.totalDizimos / sugerido) * 100 : 0 };
  }, [state, ym]);

  const lista = [...dados.dizimos, ...dados.ofertas].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <>
      <PageHeader
        title="Dízimos e Ofertas"
        subtitle={`Primeiro o Senhor — ${monthLabel(ym)}.`}
        actions={
          <>
            <button className="md-button md-button-ghost" onClick={() => setModal({ tipo: "oferta" })}>
              <Plus size={15} /> Oferta
            </button>
            <button className="md-button md-button-primary" onClick={() => setModal({ tipo: "dizimo" })}>
              <HandHeart size={15} /> Dízimo
            </button>
          </>
        }
      />

      <div className="md-grid md-grid-4">
        <StatCard tone="gold" icon={<HandHeart size={16} />} label="Dízimos do mês" value={dados.totalDizimos} />
        <StatCard tone="green" icon={<span>+</span>} label="Ofertas do mês" value={dados.totalOfertas} />
        <StatCard
          tone="dark"
          icon={<span>{dados.percentual}%</span>}
          label="Dízimo sugerido"
          value={dados.sugerido}
          hint={`Sobre receitas de ${formatBRL(dados.receitas)}`}
        />
        <StatCard
          tone="green"
          icon={<span>✓</span>}
          label="Cumprimento"
          value={`${dados.cumprimento.toFixed(0)}%`}
        />
      </div>

      <Card title="Fidelidade do mês">
        <Progress value={dados.cumprimento} />
        <p className="md-mute-xs" style={{ marginTop: 8 }}>
          {dados.totalDizimos >= dados.sugerido
            ? "Dízimo do mês cumprido. Que a fidelidade continue."
            : `Faltam ${formatBRL(Math.max(0, dados.sugerido - dados.totalDizimos))} para completar o dízimo sugerido.`}
        </p>
      </Card>

      <Card title="Contribuições registradas">
        {lista.length === 0 ? (
          <EmptyState title="Nenhuma contribuição neste mês" message="Registre dízimos e ofertas para acompanhar sua fidelidade." />
        ) : (
          <div className="md-list">
            {lista.map((item) => (
              <div className="md-list-row" key={item.id}>
                <div className="md-list-main">
                  <strong>{item.descricao}</strong>
                  <span className="md-mute-xs">
                    {formatDate(item.data)} · {item.origem === "dizimo" ? "Dízimo" : "Oferta"}
                  </span>
                </div>
                <span className="md-list-amount">{formatBRL(item.valor)}</span>
              </div>
            ))}
            <div className="md-list-total">
              <span>Total</span>
              <span>{formatBRL(dados.totalDizimos + dados.totalOfertas)}</span>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={!!modal}
        title={modal?.tipo === "dizimo" ? "Registrar dízimo" : "Registrar oferta"}
        description="A contribuição também entra como despesa do mês."
        onClose={() => setModal(null)}
      >
        {modal ? (
          <ContribuicaoForm
            tipo={modal.tipo}
            sugestao={modal.tipo === "dizimo" ? dados.sugerido : 0}
            onCancel={() => setModal(null)}
            onSubmit={(d) => {
              mordomo.registrarContribuicao(modal.tipo, d);
              showToast("Contribuição registrada.");
              setModal(null);
            }}
          />
        ) : null}
      </Modal>
      {toast}
    </>
  );
}
