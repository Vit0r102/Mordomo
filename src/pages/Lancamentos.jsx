import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader, Card, Modal, EmptyState, useToast, StatCard } from "../components/mordomo/ui";
import { LancamentoForm } from "../components/mordomo/LancamentoForm";
import { useMordomo } from "../hooks/useMordomo";
import { formatBRL, formatDate, monthLabel } from "../utils/format";
import {
  receitasDoMes,
  despesasDoMes,
  somar,
  nomeCategoria,
  nomeTipoDinheiro,
} from "../services/mordomoService";

export function Lancamentos({ tipo }) {
  const mordomo = useMordomo();
  const { state } = mordomo;
  const ym = state.configuracoes.mesReferencia;
  const [modal, setModal] = useState(null);
  const [toast, showToast] = useToast();

  const isReceita = tipo === "receita";
  const lista = useMemo(
    () => (isReceita ? receitasDoMes(state, ym) : despesasDoMes(state, ym)).slice().sort((a, b) => b.data.localeCompare(a.data)),
    [state, ym, isReceita],
  );
  const total = somar(lista);
  const media = lista.length ? total / lista.length : 0;

  const salvar = (dados) => {
    if (modal?.item) {
      (isReceita ? mordomo.updateReceita : mordomo.updateDespesa)(modal.item.id, dados);
      showToast("Lançamento atualizado.");
    } else {
      (isReceita ? mordomo.addReceita : mordomo.addDespesa)(dados);
      showToast(isReceita ? "Receita registrada." : "Despesa registrada.");
    }
    setModal(null);
  };

  const remover = (id) => {
    (isReceita ? mordomo.removeReceita : mordomo.removeDespesa)(id);
    showToast("Lançamento removido.");
  };

  return (
    <>
      <PageHeader
        title={isReceita ? "Receitas" : "Despesas"}
        subtitle={`${monthLabel(ym)} — ${lista.length} lançamento(s) registrado(s).`}
        actions={
          <button className="md-button md-button-primary" onClick={() => setModal({ item: null })}>
            <Plus size={15} /> {isReceita ? "Nova receita" : "Nova despesa"}
          </button>
        }
      />

      <div className="md-grid md-grid-3">
        <StatCard
          tone={isReceita ? "green" : "red"}
          icon={<span style={{ fontSize: 14 }}>{isReceita ? "↑" : "↓"}</span>}
          label={isReceita ? "Total recebido" : "Total gasto"}
          value={total}
        />
        <StatCard tone="gold" icon={<span style={{ fontSize: 14 }}>~</span>} label="Média por lançamento" value={media} />
        <StatCard
          tone="dark"
          icon={<span style={{ fontSize: 14 }}>#</span>}
          label="Lançamentos"
          value={String(lista.length)}
        />
      </div>

      <Card title="Lançamentos do mês">
        {lista.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento neste mês"
            message="Registre o primeiro lançamento para começar a acompanhar o mês."
            action={
              <button className="md-button md-button-primary" onClick={() => setModal({ item: null })}>
                <Plus size={15} /> Registrar
              </button>
            }
          />
        ) : (
          <>
            <div className="md-table-wrap md-stack-mobile">
              <table className="md-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Tipo de dinheiro</th>
                    <th className="md-right">Valor</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {lista.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.data)}</td>
                      <td>
                        <strong style={{ fontWeight: 500 }}>{item.descricao}</strong>
                        {item.observacao ? <div className="md-mute-xs">{item.observacao}</div> : null}
                      </td>
                      <td>{nomeCategoria(state, item.categoriaId)}</td>
                      <td>{nomeTipoDinheiro(state, item.tipoDinheiroId)}</td>
                      <td className={`md-right ${isReceita ? "md-pos" : "md-neg"}`}>
                        {formatBRL(item.valor)}
                      </td>
                      <td>
                        <div className="md-row-actions">
                          <button className="md-button-icon" onClick={() => setModal({ item })} aria-label="Editar">
                            <Pencil size={13} />
                          </button>
                          <button className="md-button-icon" onClick={() => remover(item.id)} aria-label="Excluir">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4}>Total</td>
                    <td className={`md-right ${isReceita ? "md-pos" : "md-neg"}`}>{formatBRL(total)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="md-mobile-cards">
              {lista.map((item) => (
                <div key={item.id} className="md-card md-card-quiet">
                  <div className="md-card-head" style={{ marginBottom: 6 }}>
                    <strong style={{ fontWeight: 500 }}>{item.descricao}</strong>
                    <span className={isReceita ? "md-pos" : "md-neg"} style={{ fontWeight: 600 }}>
                      {formatBRL(item.valor)}
                    </span>
                  </div>
                  <div className="md-mute-xs">
                    {formatDate(item.data)} · {nomeCategoria(state, item.categoriaId)} ·{" "}
                    {nomeTipoDinheiro(state, item.tipoDinheiroId)}
                  </div>
                  <div className="md-row-actions" style={{ marginTop: 10 }}>
                    <button className="md-button md-button-ghost md-button-sm" onClick={() => setModal({ item })}>
                      Editar
                    </button>
                    <button className="md-button md-button-danger md-button-sm" onClick={() => remover(item.id)}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Modal
        open={!!modal}
        title={modal?.item ? "Editar lançamento" : isReceita ? "Nova receita" : "Nova despesa"}
        description="Você define os dados. O MORDOMO organiza o restante."
        onClose={() => setModal(null)}
      >
        {modal ? (
          <LancamentoForm
            tipo={tipo}
            inicial={modal.item}
            onSubmit={salvar}
            onCancel={() => setModal(null)}
          />
        ) : null}
      </Modal>
      {toast}
    </>
  );
}
