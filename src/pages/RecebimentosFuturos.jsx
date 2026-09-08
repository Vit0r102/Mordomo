import { useMemo, useState } from "react";
import { Plus, Trash2, CalendarClock, CheckCircle2, Hourglass } from "lucide-react";
import { PageHeader, Card, Modal, Field, StatCard, EmptyState, Badge, useToast } from "../components/mordomo/ui";
import { useMordomo } from "../hooks/useMordomo";
import { formatBRL, formatDate, parseAmount, todayISO } from "../utils/format";
import {
  recebimentosPendentes,
  recebimentosRecebidos,
  totalRecebimentosPendentes,
  nomeCategoria,
} from "../services/mordomoService";

function RecebimentoForm({ onSubmit, onCancel }) {
  const { state } = useMordomo();
  const categorias = state.categorias.filter((c) => c.tipo === "receita");
  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    categoriaId: categorias[0]?.id || "",
    dataPrevista: "",
    observacao: "",
  });
  const [erros, setErros] = useState({});
  const set = (c) => (e) => setForm((prev) => ({ ...prev, [c]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const next = {};
        if (!form.descricao.trim()) next.descricao = "Informe uma descrição.";
        if (parseAmount(form.valor) <= 0) next.valor = "Informe um valor maior que zero.";
        setErros(next);
        if (Object.keys(next).length) return;
        onSubmit({
          descricao: form.descricao,
          valor: parseAmount(form.valor),
          categoriaId: form.categoriaId,
          dataPrevista: form.dataPrevista || null,
          observacao: form.observacao,
        });
      }}
    >
      <div className="md-form-grid">
        <Field label="Descrição" error={erros.descricao} span>
          <input
            className="md-input"
            value={form.descricao}
            onChange={set("descricao")}
            placeholder="Pagamento referente ao trabalho X"
          />
        </Field>
        <Field label="Valor (R$)" error={erros.valor}>
          <input className="md-input" value={form.valor} onChange={set("valor")} placeholder="0,00" />
        </Field>
        <Field label="Data prevista (opcional)">
          <input className="md-input" type="date" value={form.dataPrevista} onChange={set("dataPrevista")} />
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
        <Field label="Observação" span>
          <textarea className="md-textarea" value={form.observacao} onChange={set("observacao")} />
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

function ConfirmacaoForm({ recebimento, onSubmit, onCancel }) {
  const { state } = useMordomo();
  const [form, setForm] = useState({
    data: recebimento.dataPrevista || todayISO(),
    tipoDinheiroId: state.tiposDinheiro[0]?.id || "",
    contaId: state.contas[0]?.id || "",
    observacao: "",
  });
  const set = (c) => (e) => setForm((prev) => ({ ...prev, [c]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="md-form-grid">
        <Field label="Valor a registrar">
          <input className="md-input" value={formatBRL(recebimento.valor)} readOnly />
        </Field>
        <Field label="Data do recebimento">
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
            <option value="">Sem conta vinculada</option>
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
          Confirmar recebimento
        </button>
      </div>
    </form>
  );
}

export function RecebimentosFuturos() {
  const mordomo = useMordomo();
  const { state } = mordomo;
  const [modal, setModal] = useState(null);
  const [toast, showToast] = useToast();

  const dados = useMemo(
    () => ({
      pendentes: recebimentosPendentes(state),
      recebidos: recebimentosRecebidos(state),
      totalPendente: totalRecebimentosPendentes(state),
    }),
    [state],
  );

  return (
    <>
      <PageHeader
        title="Recebimentos Futuros"
        subtitle="Dinheiro esperado não é dinheiro disponível. Confirme somente quando receber."
        actions={
          <button className="md-button md-button-primary" onClick={() => setModal({ tipo: "novo" })}>
            <Plus size={15} /> Novo recebimento
          </button>
        }
      />

      <div className="md-grid md-grid-3">
        <StatCard
          tone="gold"
          icon={<Hourglass size={16} />}
          label="Pendente a receber"
          value={dados.totalPendente}
          hint="Não entra no saldo disponível"
        />
        <StatCard
          tone="dark"
          icon={<CalendarClock size={16} />}
          label="Recebimentos pendentes"
          value={String(dados.pendentes.length)}
        />
        <StatCard
          tone="green"
          icon={<CheckCircle2 size={16} />}
          label="Já confirmados"
          value={String(dados.recebidos.length)}
        />
      </div>

      <Card title="Pendentes">
        {dados.pendentes.length === 0 ? (
          <EmptyState
            title="Nenhum recebimento pendente"
            message="Registre valores que você já sabe que vai receber, mas que ainda não estão na sua mão."
          />
        ) : (
          <div className="md-list">
            {dados.pendentes.map((r) => (
              <div className="md-list-row" key={r.id}>
                <div className="md-list-main">
                  <strong>{r.descricao}</strong>
                  <span className="md-mute-xs">
                    {nomeCategoria(state, r.categoriaId)} ·{" "}
                    {r.dataPrevista ? `previsto para ${formatDate(r.dataPrevista)}` : "sem data prevista"}
                  </span>
                  {r.observacao ? (
                    <span className="md-mute-xs" style={{ display: "block" }}>
                      {r.observacao}
                    </span>
                  ) : null}

                </div>
                <div className="md-list-side">
                  <strong>{formatBRL(r.valor)}</strong>
                  <Badge tone="gold">Pendente</Badge>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    className="md-button md-button-primary md-button-sm"
                    onClick={() => setModal({ tipo: "receber", recebimento: r })}
                  >
                    Recebi
                  </button>
                  <button
                    className="md-button-icon"
                    aria-label="Excluir"
                    onClick={() => {
                      mordomo.removeRecebimentoFuturo(r.id);
                      showToast("Recebimento removido.");
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            <div className="md-list-total">
              <span>Total pendente</span>
              <span>{formatBRL(dados.totalPendente)}</span>
            </div>
          </div>
        )}
      </Card>

      <Card title="Já recebidos">
        {dados.recebidos.length === 0 ? (
          <EmptyState title="Nada confirmado ainda" message="Ao confirmar um recebimento, ele fica registrado aqui." />
        ) : (
          <div className="md-list">
            {dados.recebidos.map((r) => (
              <div className="md-list-row" key={r.id}>
                <div className="md-list-main">
                  <strong>{r.descricao}</strong>
                  <span className="md-mute-xs">
                    Recebido em {formatDate(r.dataRecebimento)} · {nomeCategoria(state, r.categoriaId)}
                  </span>
                </div>
                <div className="md-list-side">
                  <strong className="md-pos">{formatBRL(r.valor)}</strong>
                  <Badge tone="green">Recebido</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!modal}
        title={modal?.tipo === "receber" ? `Confirmar — ${modal.recebimento.descricao}` : "Novo recebimento futuro"}
        description={
          modal?.tipo === "receber"
            ? "Isso cria uma receita real e o valor passa a compor o saldo."
            : "A data prevista é opcional. O valor só entra no saldo quando você confirmar."
        }
        onClose={() => setModal(null)}
      >
        {modal?.tipo === "novo" ? (
          <RecebimentoForm
            onCancel={() => setModal(null)}
            onSubmit={(dadosForm) => {
              mordomo.addRecebimentoFuturo(dadosForm);
              showToast("Recebimento futuro registrado.");
              setModal(null);
            }}
          />
        ) : null}
        {modal?.tipo === "receber" ? (
          <ConfirmacaoForm
            recebimento={modal.recebimento}
            onCancel={() => setModal(null)}
            onSubmit={(dadosForm) => {
              mordomo.confirmarRecebimento(modal.recebimento.id, dadosForm);
              showToast("Recebimento confirmado e receita registrada.");
              setModal(null);
            }}
          />
        ) : null}
      </Modal>
      {toast}
    </>
  );
}
