import { useMemo, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";
import { PageHeader, Card, StatCard, Modal, Field, EmptyState, useToast } from "../components/mordomo/ui";
import { useMordomo } from "../hooks/useMordomo";
import { formatBRL, parseAmount, monthLabel } from "../utils/format";
import { despesasDoMes, receitasDoMes, patrimonioTotal } from "../services/mordomoService";

export function Contas() {
  const { state, addConta, removeConta, addPatrimonio, removePatrimonio } = useMordomo();
  const ym = state.configuracoes.mesReferencia;
  const [toast, showToast] = useToast();
  const [modal, setModal] = useState(null);
  const [conta, setConta] = useState({ nome: "", tipo: "Conta bancária", saldoInicial: "" });
  const [bem, setBem] = useState({ nome: "", valor: "" });

  const saldos = useMemo(() => {
    const receitas = receitasDoMes(state, ym);
    const despesas = despesasDoMes(state, ym);
    return (state.contas || []).map((c) => {
      const entradas = receitas
        .filter((r) => r.contaId === c.id)
        .reduce((a, r) => a + Number(r.valor || 0), 0);
      const saidas = despesas
        .filter((d) => d.contaId === c.id)
        .reduce((a, d) => a + Number(d.valor || 0), 0);
      return { ...c, entradas, saidas, saldo: Number(c.saldoInicial || 0) + entradas - saidas };
    });
  }, [state, ym]);

  const totalContas = saldos.reduce((a, c) => a + c.saldo, 0);
  const totalBens = (state.patrimonio || []).reduce((a, p) => a + Number(p.valor || 0), 0);

  const salvarConta = () => {
    if (!conta.nome.trim()) return showToast("Informe o nome da conta.");
    addConta({
      nome: conta.nome.trim(),
      tipo: conta.tipo,
      saldoInicial: parseAmount(conta.saldoInicial),
    });
    setConta({ nome: "", tipo: "Conta bancária", saldoInicial: "" });
    setModal(null);
    return showToast("Conta criada.");
  };

  const salvarBem = () => {
    if (!bem.nome.trim()) return showToast("Informe o nome do bem.");
    addPatrimonio({ nome: bem.nome.trim(), valor: parseAmount(bem.valor) });
    setBem({ nome: "", valor: "" });
    setModal(null);
    return showToast("Patrimônio adicionado.");
  };

  return (
    <>
      <PageHeader
        title="Contas e Patrimônio"
        subtitle={`Saldos considerando os lançamentos de ${monthLabel(ym)}.`}
        actions={
          <button className="md-button md-button-primary" onClick={() => setModal("conta")}>
            <Plus size={15} /> Nova conta
          </button>
        }
      />

      <div className="md-grid md-grid-3">
        <StatCard tone="green" icon={<Wallet size={16} />} label="Saldo em contas" value={totalContas} />
        <StatCard tone="gold" label="Bens e investimentos" value={totalBens} />
        <StatCard tone="dark" label="Patrimônio líquido" value={patrimonioTotal(state)} />
      </div>

      <Card title="Minhas contas">
        {saldos.length ? (
          <div className="md-table-wrap md-stack-mobile">
            <table className="md-table">
              <thead>
                <tr>
                  <th>Conta</th>
                  <th>Tipo</th>
                  <th className="md-right">Entradas</th>
                  <th className="md-right">Saídas</th>
                  <th className="md-right">Saldo</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {saldos.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.nome}</strong>
                    </td>
                    <td>{c.tipo}</td>
                    <td className="md-right">{formatBRL(c.entradas)}</td>
                    <td className="md-right">{formatBRL(c.saidas)}</td>
                    <td className="md-right">{formatBRL(c.saldo)}</td>
                    <td className="md-right">
                      <button
                        className="md-button-icon"
                        aria-label={`Excluir ${c.nome}`}
                        onClick={() => {
                          removeConta(c.id);
                          showToast("Conta removida.");
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Nenhuma conta" message="Cadastre onde o seu dinheiro está guardado." />
        )}
      </Card>

      <Card
        title="Bens e investimentos"
        action={
          <button className="md-button md-button-ghost md-button-sm" onClick={() => setModal("bem")}>
            <Plus size={14} /> Adicionar
          </button>
        }
      >
        {(state.patrimonio || []).length ? (
          <div className="md-list">
            {state.patrimonio.map((p) => (
              <div className="md-list-row" key={p.id}>
                <div className="md-list-main">
                  <div>
                    <strong>{p.nome}</strong>
                    <span className="md-mute-xs">{formatBRL(p.valor)}</span>
                  </div>
                </div>
                <button
                  className="md-button-icon"
                  aria-label={`Excluir ${p.nome}`}
                  onClick={() => {
                    removePatrimonio(p.id);
                    showToast("Item removido.");
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sem registros" message="Adicione imóveis, veículos ou investimentos." />
        )}
      </Card>

      <Modal
        open={modal === "conta"}
        title="Nova conta"
        description="Onde este dinheiro fica guardado."
        onClose={() => setModal(null)}
      >
        <div className="md-form-grid">
          <Field label="Nome" span="full">
            <input
              className="md-input"
              value={conta.nome}
              onChange={(e) => setConta({ ...conta, nome: e.target.value })}
              placeholder="Ex.: Conta Salário"
            />
          </Field>
          <Field label="Tipo">
            <select
              className="md-select"
              value={conta.tipo}
              onChange={(e) => setConta({ ...conta, tipo: e.target.value })}
            >
              <option>Conta bancária</option>
              <option>Dinheiro</option>
              <option>Cartão</option>
              <option>Investimento</option>
            </select>
          </Field>
          <Field label="Saldo inicial">
            <input
              className="md-input"
              value={conta.saldoInicial}
              onChange={(e) => setConta({ ...conta, saldoInicial: e.target.value })}
              placeholder="0,00"
            />
          </Field>
        </div>
        <div className="md-modal-actions">
          <button className="md-button md-button-ghost" onClick={() => setModal(null)}>
            Cancelar
          </button>
          <button className="md-button md-button-primary" onClick={salvarConta}>
            Salvar
          </button>
        </div>
      </Modal>

      <Modal
        open={modal === "bem"}
        title="Novo bem ou investimento"
        onClose={() => setModal(null)}
      >
        <div className="md-form-grid">
          <Field label="Nome" span="full">
            <input
              className="md-input"
              value={bem.nome}
              onChange={(e) => setBem({ ...bem, nome: e.target.value })}
              placeholder="Ex.: Veículo"
            />
          </Field>
          <Field label="Valor estimado">
            <input
              className="md-input"
              value={bem.valor}
              onChange={(e) => setBem({ ...bem, valor: e.target.value })}
              placeholder="0,00"
            />
          </Field>
        </div>
        <div className="md-modal-actions">
          <button className="md-button md-button-ghost" onClick={() => setModal(null)}>
            Cancelar
          </button>
          <button className="md-button md-button-primary" onClick={salvarBem}>
            Salvar
          </button>
        </div>
      </Modal>

      {toast}
    </>
  );
}
