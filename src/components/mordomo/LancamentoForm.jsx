import { useState } from "react";
import { Field } from "./ui";
import { useMordomo } from "../../hooks/useMordomo";
import { parseAmount, todayISO } from "../../utils/format";

export function LancamentoForm({ tipo, inicial, onSubmit, onCancel }) {
  const { state } = useMordomo();
  const categorias = state.categorias.filter((c) => c.tipo === tipo);
  const [form, setForm] = useState(() => ({
    descricao: inicial?.descricao || "",
    valor: inicial ? String(inicial.valor).replace(".", ",") : "",
    categoriaId: inicial?.categoriaId || categorias[0]?.id || "",
    tipoDinheiroId: inicial?.tipoDinheiroId || state.tiposDinheiro[0]?.id || "",
    contaId: inicial?.contaId || state.contas[0]?.id || "",
    data: inicial?.data || todayISO(),
    observacao: inicial?.observacao || "",
  }));
  const [erros, setErros] = useState({});

  const set = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const proximosErros = {};
    if (!form.descricao.trim()) proximosErros.descricao = "Informe uma descrição.";
    if (parseAmount(form.valor) <= 0) proximosErros.valor = "Informe um valor maior que zero.";
    if (!form.data) proximosErros.data = "Informe a data.";
    setErros(proximosErros);
    if (Object.keys(proximosErros).length) return;
    onSubmit({ ...form, valor: parseAmount(form.valor) });
  };

  return (
    <form onSubmit={submit}>
      <div className="md-form-grid">
        <Field label="Descrição" error={erros.descricao} span>
          <input
            className="md-input"
            value={form.descricao}
            onChange={set("descricao")}
            placeholder={tipo === "receita" ? "Salário, freelance..." : "Supermercado, aluguel..."}
          />
        </Field>
        <Field label="Valor (R$)" error={erros.valor}>
          <input className="md-input" value={form.valor} onChange={set("valor")} placeholder="0,00" />
        </Field>
        <Field label="Data" error={erros.data}>
          <input className="md-input" type="date" value={form.data} onChange={set("data")} />
        </Field>
        <Field label="Categoria">
          <select className="md-select" value={form.categoriaId} onChange={set("categoriaId")}>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
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
        <Field label="Conta" span>
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
          Salvar
        </button>
      </div>
    </form>
  );
}
