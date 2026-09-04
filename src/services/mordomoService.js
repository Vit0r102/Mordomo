import { monthKey, lastMonths, monthShort } from "../utils/format";

export function receitasDoMes(state, ym) {
  return state.receitas.filter((r) => monthKey(r.data) === ym);
}

export function despesasDoMes(state, ym) {
  return state.despesas.filter((d) => monthKey(d.data) === ym);
}

export function somar(lista) {
  return lista.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
}

export function totaisDoMes(state, ym) {
  const receitas = somar(receitasDoMes(state, ym));
  const despesas = somar(despesasDoMes(state, ym));
  return { receitas, despesas, saldo: receitas - despesas };
}

export function variacao(atual, anterior) {
  if (!anterior) return null;
  return ((atual - anterior) / anterior) * 100;
}

export function patrimonioTotal(state) {
  const bens = somar(state.patrimonio || []);
  const contas = (state.contas || []).reduce((acc, c) => acc + (Number(c.saldoInicial) || 0), 0);
  const dividasRestantes = (state.dividas || []).reduce((acc, d) => acc + restanteDivida(d), 0);
  return bens + contas - dividasRestantes;
}

export function serieFluxo(state, ym, meses) {
  return lastMonths(ym, meses).map((m) => {
    const t = totaisDoMes(state, m);
    return { mes: monthShort(m), ym: m, receitas: t.receitas, despesas: t.despesas, saldo: t.saldo };
  });
}

export function distribuicaoDespesas(state, ym) {
  const despesas = despesasDoMes(state, ym);
  const total = somar(despesas);
  const porCategoria = new Map();
  despesas.forEach((d) => {
    porCategoria.set(d.categoriaId, (porCategoria.get(d.categoriaId) || 0) + Number(d.valor || 0));
  });
  return Array.from(porCategoria.entries())
    .map(([categoriaId, valor]) => {
      const cat = state.categorias.find((c) => c.id === categoriaId);
      return {
        categoriaId,
        nome: cat ? cat.nome : "Sem categoria",
        cor: cat ? cat.cor : "#b8b3a6",
        valor,
        percentual: total ? (valor / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.valor - a.valor);
}

export function contasAPagar(state, ym) {
  const [ano, mes] = ym.split("-");
  return (state.pagamentosFixos || [])
    .map((p) => {
      const vencimento = `${ano}-${mes}-${String(p.diaVencimento).padStart(2, "0")}`;
      const pago = despesasDoMes(state, ym).some((d) => d.pagamentoFixoId === p.id);
      return { ...p, vencimento, pago };
    })
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));
}

export function proximosCompromissos(state, ym) {
  const [ano, mes] = ym.split("-");
  const doPlanejamento = (state.planejamentos || [])
    .filter((p) => p.regra !== "limite")
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      valor: valorPlanejado(state, p, ym),
      data: `${ano}-${mes}-${String(diaDoCompromisso(state, p)).padStart(2, "0")}`,
    }));
  return doPlanejamento.sort((a, b) => a.data.localeCompare(b.data));
}

function diaDoCompromisso(state, planejamento) {
  const fixo = (state.pagamentosFixos || []).find((f) => f.nome === planejamento.nome);
  if (fixo) return fixo.diaVencimento;
  const divida = (state.dividas || []).find((d) => d.nome === planejamento.nome);
  if (divida && divida.proximoPagamento) return Number(divida.proximoPagamento.slice(8, 10));
  return 15;
}

export function valorPlanejado(state, planejamento, ym) {
  if (planejamento.regra === "porcentagem") {
    const { receitas } = totaisDoMes(state, ym);
    return (receitas * (Number(planejamento.percentual) || 0)) / 100;
  }
  return Number(planejamento.valor) || 0;
}

export function resumoPlanejamento(state, ym) {
  const planejado = (state.planejamentos || []).reduce(
    (acc, p) => acc + valorPlanejado(state, p, ym),
    0,
  );
  const realizado = somar(despesasDoMes(state, ym));
  const { receitas } = totaisDoMes(state, ym);
  return {
    planejado,
    realizado,
    disponivelPlanejado: receitas - planejado,
    percentualRealizado: planejado ? (realizado / planejado) * 100 : 0,
  };
}

export function planejadoVsRealizado(state, ym) {
  return (state.planejamentos || []).map((p) => {
    const planejado = valorPlanejado(state, p, ym);
    const realizado = somar(
      despesasDoMes(state, ym).filter((d) => d.categoriaId === p.categoriaId),
    );
    return { nome: p.nome, planejado, realizado, diferenca: planejado - realizado };
  });
}

export function pagoDivida(divida) {
  return (divida.pagamentos || []).reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
}

export function restanteDivida(divida) {
  return Math.max(0, (Number(divida.valorTotal) || 0) - pagoDivida(divida));
}

export function percentualQuitado(divida) {
  const total = Number(divida.valorTotal) || 0;
  if (!total) return 0;
  return (pagoDivida(divida) / total) * 100;
}

export function resumoDividas(state) {
  const lista = state.dividas || [];
  return {
    totalDevido: lista.reduce((acc, d) => acc + (Number(d.valorTotal) || 0), 0),
    totalPago: lista.reduce((acc, d) => acc + pagoDivida(d), 0),
    totalRestante: lista.reduce((acc, d) => acc + restanteDivida(d), 0),
  };
}

export function movimentacoes(state, filtros = {}) {
  const receitas = state.receitas.map((r) => ({ ...r, tipo: "receita" }));
  const despesas = state.despesas.map((d) => ({ ...d, tipo: "despesa" }));
  let todas = [...receitas, ...despesas].sort((a, b) => b.data.localeCompare(a.data));

  if (filtros.busca) {
    const termo = filtros.busca.toLowerCase();
    todas = todas.filter((m) => m.descricao.toLowerCase().includes(termo));
  }
  if (filtros.tipo && filtros.tipo !== "todos") todas = todas.filter((m) => m.tipo === filtros.tipo);
  if (filtros.categoriaId && filtros.categoriaId !== "todas")
    todas = todas.filter((m) => m.categoriaId === filtros.categoriaId);
  if (filtros.mes && filtros.mes !== "todos") todas = todas.filter((m) => monthKey(m.data) === filtros.mes);

  return todas;
}

export function religiosos(state, ym) {
  const dizimos = despesasDoMes(state, ym).filter((d) => d.origem === "dizimo");
  const ofertas = despesasDoMes(state, ym).filter((d) => d.origem === "oferta");
  return { dizimos, ofertas, totalDizimos: somar(dizimos), totalOfertas: somar(ofertas) };
}

export function economia(state, meses) {
  const receitas = meses.reduce((acc, m) => acc + m.receitas, 0);
  const saldo = meses.reduce((acc, m) => acc + m.saldo, 0);
  return receitas ? (saldo / receitas) * 100 : 0;
}

export function nomeCategoria(state, id) {
  const cat = (state.categorias || []).find((c) => c.id === id);
  return cat ? cat.nome : "—";
}

export function nomeTipoDinheiro(state, id) {
  const tipo = (state.tiposDinheiro || []).find((t) => t.id === id);
  return tipo ? tipo.nome : "—";
}
