import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Card, Modal, Field, StatCard, EmptyState, Progress, useToast } from "../components/mordomo/ui";
import { useMordomo } from "../hooks/useMordomo";
import { formatBRL, formatDate, parseAmount, todayISO } from "../utils/format";
import { resumoDividas, pagoDivida, restanteDivida, percentualQuitado } from "../services/mordomoService";

function DividaForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ nome: "", valorTotal: "", pagamentoPlanejado: "", proximoPagamento: todayISO() });
  const [erros, setErros] = useState({});
  const set = (c) => (e) => setForm((prev) => ({ ...prev, [c]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const next = {};
        if (!form.nome.trim()) next.nome = "Informe o nome da dívida.";
        if (parseAmount(form.valorTotal) <= 0) next.valorTotal = "Informe o valor total.";
        setErros(next);
        if (Object.keys(next).length) return;
        onSubmit({
          nome: form.nome,
          valorTotal: parseAmount(form.valorTotal),
          pagamentoPlanejado: parseAmount(form.pagamentoPlanejado),
          proximoPagamento: form.proximoPagamento,
        });
      }}
    >
      <div className="md-form-grid">
        <Field label="Nome" error={erros.nome} span>
          <input className="md-input" value={form.nome} onChange={set("nome")} placeholder="Financiamento, cartão..." />
        </Field>
        <Field label="Valor total (R$)" error={erros.valorTotal}>
          <input className="md-input" value={form.valorTotal} onChange={set("valorTotal")} placeholder="0,00" />
        </Field>
        <Field label="Pagamento planejado (R$)">
          <input className="md-input" value={form.pagamentoPlanejado} onChange={set("pagamentoPlanejado")} placeholder="0,00" />
        </Field>
        <Field label="Próximo pagamento" span>
          <input className="md-input" type="date" value={form.proximoPagamento} onChange={set("proximoPagamento")} />
        </Field>
      </div>
      <div className="md-form-actions">
        <button type="button" className="md-button md-button-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="md-button md-button-primary">
          Salvar
        </button>
      </div>
    </form>
  );
}

function PagamentoForm({ divida, onSubmit, onCancel }) {
  const { state } = useMordomo();
  const [form, setForm] = useState({
    valor: String(divida.pagamentoPlanejado || "").replace(".", ","),
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
          Registrar pagamento
        </button>
      </div>
    </form>
  );
}

export function Dividas() {
  const mordomo = useMordomo();
  const { state } = mordomo;
  const [modal, setModal] = useState(null);
  const [toast, showToast] = useToast();
  const resumo = useMemo(() => resumoDividas(state), [state]);

  return (
    <>
      <PageHeader
        title="Dívidas"
        subtitle="Quitar é liberdade. Acompanhe cada passo do caminho."
        actions={
          <button className="md-button md-button-primary" onClick={() => setModal({ tipo: "nova" })}>
            <Plus size={15} /> Nova dívida
          </button>
        }
      />

      <div className="md-grid md-grid-3">
        <StatCard tone="dark" icon={<span>Σ</span>} label="Total devido" value={resumo.totalDevido} />
        <StatCard tone="green" icon={<span>✓</span>} label="Total pago" value={resumo.totalPago} />
        <StatCard tone="red" icon={<span>!</span>} label="Restante" value={resumo.totalRestante} />
      </div>

      {state.dividas.length === 0 ? (
        <Card>
          <EmptyState title="Nenhuma dívida registrada" message="Que bom! Se surgir alguma, registre para acompanhar a quitação." />
        </Card>
      ) : (
        <div className="md-grid md-grid-2">
          {state.dividas.map((d) => (
            <Card
              key={d.id}
              title={d.nome}
              action={
                <button
                  className="md-button-icon"
                  onClick={() => {
                    mordomo.removeDivida(d.id);
                    showToast("Dívida removida.");
                  }}
                  aria-label="Excluir"
                >
                  <Trash2 size={13} />
                </button>
              }
            >
              <div className="md-value">{formatBRL(restanteDivida(d))}</div>
              <div className="md-mute-xs" style={{ marginBottom: 12 }}>
                restante de {formatBRL(d.valorTotal)} · pago {formatBRL(pagoDivida(d))}
              </div>
              <Progress value={percentualQuitado(d)} />
              <div className="md-mute-xs" style={{ marginTop: 6 }}>
                {percentualQuitado(d).toFixed(0)}% quitado · próximo pagamento {formatDate(d.proximoPagamento)}
              </div>

              <div className="md-list" style={{ marginTop: 12 }}>
                {(d.pagamentos || []).slice(-3).reverse().map((p) => (
                  <div className="md-list-row" key={p.id}>
                    <div className="md-list-main">
                      <strong>Pagamento</strong>
                      <span className="md-mute-xs">{formatDate(p.data)}</span>
                    </div>
                    <span className="md-list-amount">{formatBRL(p.valor)}</span>
                  </div>
                ))}
              </div>

              <div className="md-form-actions">
                <button className="md-button md-button-primary md-button-sm" onClick={() => setModal({ tipo: "pagar", divida: d })}>
                  Registrar pagamento
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal?.tipo === "pagar" ? `Pagamento — ${modal.divida.nome}` : "Nova dívida"}
        description={modal?.tipo === "pagar" ? "O pagamento também vira despesa do mês." : "Registre o compromisso para acompanhar a quitação."}
        onClose={() => setModal(null)}
      >
        {modal?.tipo === "nova" ? (
          <DividaForm
            onCancel={() => setModal(null)}
            onSubmit={(dados) => {
              mordomo.addDivida(dados);
              showToast("Dívida registrada.");
              setModal(null);
            }}
          />
        ) : null}
        {modal?.tipo === "pagar" ? (
          <PagamentoForm
            divida={modal.divida}
            onCancel={() => setModal(null)}
            onSubmit={(dados) => {
              mordomo.registrarPagamentoDivida(modal.divida.id, dados);
              showToast("Pagamento registrado.");
              setModal(null);
            }}
          />
        ) : null}
      </Modal>
      {toast}
    </>
  );
}
