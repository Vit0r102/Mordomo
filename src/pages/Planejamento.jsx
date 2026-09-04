import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { PageHeader, Card, Modal, Field, StatCard, EmptyState, Progress, useToast, Badge } from "../components/mordomo/ui";
import { useMordomo } from "../hooks/useMordomo";
import { formatBRL, monthLabel, parseAmount } from "../utils/format";
import { resumoPlanejamento, planejadoVsRealizado, valorPlanejado, contasAPagar } from "../services/mordomoService";

const REGRAS = [
  { value: "valor_fixo", label: "Valor fixo" },
  { value: "valor_definido", label: "Valor definido" },
  { value: "porcentagem", label: "Porcentagem da receita" },
  { value: "limite", label: "Limite de gasto" },
];

const TIPOS = ["Conta Fixa", "Dívida", "Gasto", "Religioso", "Meta"];

function PlanejamentoForm({ inicial, onSubmit, onCancel }) {
  const { state } = useMordomo();
  const categorias = state.categorias.filter((c) => c.tipo === "despesa");
  const [form, setForm] = useState(() => ({
    nome: inicial?.nome || "",
    tipo: inicial?.tipo || TIPOS[0],
    regra: inicial?.regra || "valor_fixo",
    valor: inicial?.valor ? String(inicial.valor).replace(".", ",") : "",
    percentual: inicial?.percentual ? String(inicial.percentual) : "",
    frequencia: inicial?.frequencia || "Mensal",
    categoriaId: inicial?.categoriaId || categorias[0]?.id || "",
  }));
  const [erros, setErros] = useState({});
  const set = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.nome.trim()) next.nome = "Informe um nome.";
    if (form.regra === "porcentagem" ? !Number(form.percentual) : parseAmount(form.valor) <= 0)
      next.valor = "Informe um valor válido.";
    setErros(next);
    if (Object.keys(next).length) return;
    onSubmit({
      ...form,
      valor: form.regra === "porcentagem" ? null : parseAmount(form.valor),
      percentual: form.regra === "porcentagem" ? Number(form.percentual) : null,
      periodo: state.configuracoes.mesReferencia,
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="md-form-grid">
        <Field label="Nome" error={erros.nome} span>
          <input className="md-input" value={form.nome} onChange={set("nome")} placeholder="Aluguel, Dízimo..." />
        </Field>
        <Field label="Tipo">
          <select className="md-select" value={form.tipo} onChange={set("tipo")}>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Regra">
          <select className="md-select" value={form.regra} onChange={set("regra")}>
            {REGRAS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
        {form.regra === "porcentagem" ? (
          <Field label="Percentual (%)" error={erros.valor}>
            <input className="md-input" value={form.percentual} onChange={set("percentual")} placeholder="10" />
          </Field>
        ) : (
          <Field label="Valor (R$)" error={erros.valor}>
            <input className="md-input" value={form.valor} onChange={set("valor")} placeholder="0,00" />
          </Field>
        )}
        <Field label="Frequência">
          <select className="md-select" value={form.frequencia} onChange={set("frequencia")}>
            <option value="Mensal">Mensal</option>
            <option value="Quinzenal">Quinzenal</option>
            <option value="Anual">Anual</option>
            <option value="Único">Único</option>
          </select>
        </Field>
        <Field label="Categoria" span>
          <select className="md-select" value={form.categoriaId} onChange={set("categoriaId")}>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
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

export function Planejamento() {
  const mordomo = useMordomo();
  const { state } = mordomo;
  const ym = state.configuracoes.mesReferencia;
  const [modal, setModal] = useState(null);
  const [toast, showToast] = useToast();

  const resumo = useMemo(() => resumoPlanejamento(state, ym), [state, ym]);
  const comparativo = useMemo(() => planejadoVsRealizado(state, ym), [state, ym]);
  const fixos = useMemo(() => contasAPagar(state, ym), [state, ym]);

  const salvar = (dados) => {
    if (modal?.item) {
      mordomo.updatePlanejamento(modal.item.id, dados);
      showToast("Planejamento atualizado.");
    } else {
      mordomo.addPlanejamento(dados);
      showToast("Planejamento criado.");
    }
    setModal(null);
  };

  return (
    <>
      <PageHeader
        title="Planejamento"
        subtitle={`Decida antes de gastar — ${monthLabel(ym)}.`}
        actions={
          <button className="md-button md-button-primary" onClick={() => setModal({ item: null })}>
            <Plus size={15} /> Novo planejamento
          </button>
        }
      />

      <div className="md-grid md-grid-4">
        <StatCard tone="dark" icon={<span>Σ</span>} label="Planejado" value={resumo.planejado} />
        <StatCard tone="red" icon={<span>↓</span>} label="Realizado" value={resumo.realizado} />
        <StatCard tone="green" icon={<span>=</span>} label="Disponível conforme o plano" value={resumo.disponivelPlanejado} />
        <StatCard
          tone="gold"
          icon={<span>%</span>}
          label="Execução do plano"
          value={`${resumo.percentualRealizado.toFixed(0)}%`}
        />
      </div>

      <Card title="Planejado × Realizado">
        {comparativo.length === 0 ? (
          <EmptyState title="Nenhum planejamento" message="Crie o primeiro planejamento do mês." />
        ) : (
          <div className="md-list">
            {comparativo.map((c) => {
              const pct = c.planejado ? (c.realizado / c.planejado) * 100 : 0;
              return (
                <div className="md-list-row" key={c.nome} style={{ display: "block" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <strong style={{ fontWeight: 500 }}>{c.nome}</strong>
                    <span className="md-list-amount">
                      {formatBRL(c.realizado)} / {formatBRL(c.planejado)}
                    </span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Progress value={pct} />
                  </div>
                  <div className="md-mute-xs" style={{ marginTop: 6 }}>
                    {c.diferenca >= 0
                      ? `${formatBRL(c.diferenca)} ainda disponível`
                      : `${formatBRL(Math.abs(c.diferenca))} acima do planejado`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="md-grid md-grid-2">
        <Card title="Itens planejados">
          {state.planejamentos.length === 0 ? (
            <EmptyState title="Nada aqui" message="Adicione contas fixas, dívidas, metas e limites." />
          ) : (
            <div className="md-list">
              {state.planejamentos.map((p) => (
                <div className="md-list-row" key={p.id}>
                  <div className="md-list-main">
                    <strong>{p.nome}</strong>
                    <span className="md-mute-xs">
                      {p.tipo} · {REGRAS.find((r) => r.value === p.regra)?.label} · {p.frequencia}
                    </span>
                  </div>
                  <span className="md-list-amount">{formatBRL(valorPlanejado(state, p, ym))}</span>
                  <div className="md-row-actions">
                    <button className="md-button-icon" onClick={() => setModal({ item: p })} aria-label="Editar">
                      <Pencil size={13} />
                    </button>
                    <button
                      className="md-button-icon"
                      onClick={() => {
                        mordomo.removePlanejamento(p.id);
                        showToast("Planejamento removido.");
                      }}
                      aria-label="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Contas fixas do mês">
          {fixos.length === 0 ? (
            <EmptyState title="Sem contas fixas" message="Cadastre em Configurações ou aqui pelo planejamento." />
          ) : (
            <div className="md-list">
              {fixos.map((f) => (
                <div className="md-list-row" key={f.id}>
                  <div className="md-list-main">
                    <strong>{f.nome}</strong>
                    <span className="md-mute-xs">Vence dia {String(f.diaVencimento).padStart(2, "0")}</span>
                  </div>
                  <span className="md-list-amount">{formatBRL(f.valor)}</span>
                  <Badge tone={f.pago ? "green" : "gold"}>{f.pago ? "Pago" : "Pendente"}</Badge>
                  {!f.pago ? (
                    <button
                      className="md-button md-button-ghost md-button-sm"
                      onClick={() => {
                        mordomo.registrarPagamentoFixo(f.id, { valor: f.valor, data: f.vencimento });
                        showToast(`${f.nome} pago.`);
                      }}
                    >
                      Pagar
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={!!modal}
        title={modal?.item ? "Editar planejamento" : "Novo planejamento"}
        description="Defina o destino de cada real antes do mês começar."
        onClose={() => setModal(null)}
      >
        {modal ? <PlanejamentoForm inicial={modal.item} onSubmit={salvar} onCancel={() => setModal(null)} /> : null}
      </Modal>
      {toast}
    </>
  );
}
