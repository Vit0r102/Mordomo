import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Card, Modal, Field, EmptyState, useToast } from "../components/mordomo/ui";
import { useMordomo } from "../hooks/useMordomo";
import { formatBRL } from "../utils/format";
import { despesasDoMes, receitasDoMes } from "../services/mordomoService";

const CORES = ["#1f4d3a", "#2f6b4f", "#4c8c6b", "#7fae92", "#c9a15a", "#b4553f", "#8a8f7d", "#6d6a60"];

export function Categorias() {
  const {
    state,
    addCategoria,
    removeCategoria,
    addTipoDinheiro,
    removeTipoDinheiro,
  } = useMordomo();
  const ym = state.configuracoes.mesReferencia;
  const [toast, showToast] = useToast();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nome: "", tipo: "despesa", cor: CORES[0] });
  const [tipoNome, setTipoNome] = useState("");

  const usoPorCategoria = useMemo(() => {
    const mapa = new Map();
    [...despesasDoMes(state, ym), ...receitasDoMes(state, ym)].forEach((m) => {
      mapa.set(m.categoriaId, (mapa.get(m.categoriaId) || 0) + Number(m.valor || 0));
    });
    return mapa;
  }, [state, ym]);

  const salvarCategoria = () => {
    if (!form.nome.trim()) return showToast("Informe o nome da categoria.");
    addCategoria({ nome: form.nome.trim(), tipo: form.tipo, cor: form.cor });
    setForm({ nome: "", tipo: "despesa", cor: CORES[0] });
    setModal(null);
    return showToast("Categoria criada.");
  };

  const salvarTipo = () => {
    if (!tipoNome.trim()) return showToast("Informe o nome.");
    addTipoDinheiro({ nome: tipoNome.trim() });
    setTipoNome("");
    setModal(null);
    return showToast("Tipo de dinheiro criado.");
  };

  const grupos = [
    { titulo: "Categorias de despesa", tipo: "despesa" },
    { titulo: "Categorias de receita", tipo: "receita" },
  ];

  return (
    <>
      <PageHeader
        title="Categorias"
        subtitle="Organize para onde o dinheiro vai e de onde ele vem."
        actions={
          <button className="md-button md-button-primary" onClick={() => setModal("categoria")}>
            <Plus size={15} /> Nova categoria
          </button>
        }
      />

      <div className="md-grid md-grid-2">
        {grupos.map((grupo) => {
          const lista = state.categorias.filter((c) => c.tipo === grupo.tipo);
          return (
            <Card key={grupo.tipo} title={grupo.titulo}>
              {lista.length ? (
                <div className="md-list">
                  {lista.map((c) => (
                    <div className="md-list-row" key={c.id}>
                      <div className="md-list-main">
                        <span className="md-dot" style={{ background: c.cor }} />
                        <div>
                          <strong>{c.nome}</strong>
                          <span className="md-mute-xs">
                            {formatBRL(usoPorCategoria.get(c.id) || 0)} no mês
                          </span>
                        </div>
                      </div>
                      <button
                        className="md-button-icon"
                        aria-label={`Excluir ${c.nome}`}
                        onClick={() => {
                          removeCategoria(c.id);
                          showToast("Categoria removida.");
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Nenhuma categoria" message="Crie a primeira categoria." />
              )}
            </Card>
          );
        })}
      </div>

      <Card
        title="Tipos de dinheiro"
        action={
          <button className="md-button md-button-ghost md-button-sm" onClick={() => setModal("tipo")}>
            <Plus size={14} /> Novo tipo
          </button>
        }
      >
        <div className="md-list">
          {(state.tiposDinheiro || []).map((t) => (
            <div className="md-list-row" key={t.id}>
              <div className="md-list-main">
                <strong>{t.nome}</strong>
              </div>
              <button
                className="md-button-icon"
                aria-label={`Excluir ${t.nome}`}
                onClick={() => {
                  removeTipoDinheiro(t.id);
                  showToast("Tipo removido.");
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        open={modal === "categoria"}
        title="Nova categoria"
        description="Defina nome, tipo e cor de identificação."
        onClose={() => setModal(null)}
      >
        <div className="md-form-grid">
          <Field label="Nome" span="full">
            <input
              className="md-input"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex.: Manutenção do carro"
            />
          </Field>
          <Field label="Tipo">
            <select
              className="md-select"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </select>
          </Field>
          <Field label="Cor">
            <div className="md-color-row">
              {CORES.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  aria-label={`Cor ${cor}`}
                  className={`md-color-dot${form.cor === cor ? " is-active" : ""}`}
                  style={{ background: cor }}
                  onClick={() => setForm({ ...form, cor })}
                />
              ))}
            </div>
          </Field>
        </div>
        <div className="md-modal-actions">
          <button className="md-button md-button-ghost" onClick={() => setModal(null)}>
            Cancelar
          </button>
          <button className="md-button md-button-primary" onClick={salvarCategoria}>
            Salvar
          </button>
        </div>
      </Modal>

      <Modal
        open={modal === "tipo"}
        title="Novo tipo de dinheiro"
        description="Como o valor entra ou sai (Pix, cartão, dinheiro...)."
        onClose={() => setModal(null)}
      >
        <div className="md-form-grid">
          <Field label="Nome" span="full">
            <input
              className="md-input"
              value={tipoNome}
              onChange={(e) => setTipoNome(e.target.value)}
              placeholder="Ex.: Vale alimentação"
            />
          </Field>
        </div>
        <div className="md-modal-actions">
          <button className="md-button md-button-ghost" onClick={() => setModal(null)}>
            Cancelar
          </button>
          <button className="md-button md-button-primary" onClick={salvarTipo}>
            Salvar
          </button>
        </div>
      </Modal>

      {toast}
    </>
  );
}
