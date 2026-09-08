import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { loadState, saveState, resetState } from "../repositories/localStorageRepository";
import { buildSeedState } from "../data/seed";
import { uid } from "../utils/format";
import { converterRecebimentoEmReceita } from "../services/mordomoService";


const MordomoContext = createContext(null);

export function MordomoProvider({ children }) {
  const [state, setState] = useState(() => buildSeedState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const update = useCallback((fn) => setState((prev) => fn(prev)), []);

  const api = useMemo(() => {
    const addTo = (colecao, prefixo) => (item) =>
      update((prev) => ({ ...prev, [colecao]: [...(prev[colecao] || []), { ...item, id: uid(prefixo) }] }));
    const updateIn = (colecao) => (id, patch) =>
      update((prev) => ({
        ...prev,
        [colecao]: prev[colecao].map((item) => (item.id === id ? { ...item, ...patch } : item)),
      }));
    const removeFrom = (colecao) => (id) =>
      update((prev) => ({ ...prev, [colecao]: prev[colecao].filter((item) => item.id !== id) }));

    return {
      addReceita: addTo("receitas", "rec"),
      updateReceita: updateIn("receitas"),
      removeReceita: removeFrom("receitas"),
      addDespesa: addTo("despesas", "des"),
      updateDespesa: updateIn("despesas"),
      removeDespesa: removeFrom("despesas"),
      addCategoria: addTo("categorias", "cat"),
      updateCategoria: updateIn("categorias"),
      removeCategoria: removeFrom("categorias"),
      addTipoDinheiro: addTo("tiposDinheiro", "tip"),
      removeTipoDinheiro: removeFrom("tiposDinheiro"),
      addConta: addTo("contas", "con"),
      updateConta: updateIn("contas"),
      removeConta: removeFrom("contas"),
      addPlanejamento: addTo("planejamentos", "pl"),
      updatePlanejamento: updateIn("planejamentos"),
      removePlanejamento: removeFrom("planejamentos"),
      addPagamentoFixo: addTo("pagamentosFixos", "fx"),
      removePagamentoFixo: removeFrom("pagamentosFixos"),
      addDivida: (divida) =>
        update((prev) => ({
          ...prev,
          dividas: [...prev.dividas, { ...divida, id: uid("div"), pagamentos: [] }],
        })),
      updateDivida: updateIn("dividas"),
      removeDivida: removeFrom("dividas"),
      registrarPagamentoDivida: (dividaId, pagamento) =>
        update((prev) => {
          const divida = prev.dividas.find((d) => d.id === dividaId);
          if (!divida) return prev;
          const despesa = {
            id: uid("des"),
            descricao: `Pagamento — ${divida.nome}`,
            valor: Number(pagamento.valor) || 0,
            categoriaId: "cat_dividas",
            tipoDinheiroId: pagamento.tipoDinheiroId || null,
            contaId: pagamento.contaId || null,
            data: pagamento.data,
            observacao: pagamento.observacao || "",
            dividaId,
            origem: "divida",
          };
          return {
            ...prev,
            despesas: [...prev.despesas, despesa],
            dividas: prev.dividas.map((d) =>
              d.id === dividaId
                ? {
                    ...d,
                    pagamentos: [
                      ...(d.pagamentos || []),
                      { id: uid("pag"), valor: Number(pagamento.valor) || 0, data: pagamento.data },
                    ],
                  }
                : d,
            ),
          };
        }),
      registrarContribuicao: (tipo, dados) =>
        update((prev) => ({
          ...prev,
          despesas: [
            ...prev.despesas,
            {
              id: uid("des"),
              descricao: dados.descricao || (tipo === "dizimo" ? "Dízimo" : "Oferta"),
              valor: Number(dados.valor) || 0,
              categoriaId: "cat_religioso",
              tipoDinheiroId: dados.tipoDinheiroId || null,
              contaId: dados.contaId || null,
              data: dados.data,
              observacao: dados.observacao || "",
              origem: tipo,
            },
          ],
        })),
      registrarPagamentoFixo: (pagamentoFixoId, dados) =>
        update((prev) => {
          const fixo = prev.pagamentosFixos.find((f) => f.id === pagamentoFixoId);
          if (!fixo) return prev;
          return {
            ...prev,
            despesas: [
              ...prev.despesas,
              {
                id: uid("des"),
                descricao: fixo.nome,
                valor: Number(dados.valor) || fixo.valor,
                categoriaId: fixo.categoriaId,
                tipoDinheiroId: dados.tipoDinheiroId || null,
                contaId: dados.contaId || null,
                data: dados.data,
                observacao: dados.observacao || "",
                pagamentoFixoId,
                origem: "conta_fixa",
              },
            ],
          };
        }),
      addPatrimonio: addTo("patrimonio", "pat"),
      removePatrimonio: removeFrom("patrimonio"),
      addRecebimentoFuturo: (dados) =>
        update((prev) => ({
          ...prev,
          recebimentosFuturos: [
            ...(prev.recebimentosFuturos || []),
            {
              id: uid("rf"),
              descricao: dados.descricao,
              valor: Number(dados.valor) || 0,
              categoriaId: dados.categoriaId || null,
              dataPrevista: dados.dataPrevista || null,
              observacao: dados.observacao || "",
              recebido: false,
              receitaId: null,
              dataRecebimento: null,
            },
          ],
        })),
      removeRecebimentoFuturo: removeFrom("recebimentosFuturos"),
      confirmarRecebimento: (recebimentoId, dados = {}) =>
        update((prev) => {
          const alvo = (prev.recebimentosFuturos || []).find((r) => r.id === recebimentoId);
          const novaReceita = converterRecebimentoEmReceita(alvo, dados);
          if (!novaReceita) return prev;
          const receitaId = uid("rec");
          return {
            ...prev,
            receitas: [...prev.receitas, { ...novaReceita, id: receitaId }],
            recebimentosFuturos: prev.recebimentosFuturos.map((r) =>
              r.id === recebimentoId
                ? { ...r, recebido: true, receitaId, dataRecebimento: novaReceita.data }
                : r,
            ),
          };
        }),

      setConfiguracoes: (patch) =>
        update((prev) => ({ ...prev, configuracoes: { ...prev.configuracoes, ...patch } })),
      setUsuario: (patch) => update((prev) => ({ ...prev, usuario: { ...prev.usuario, ...patch } })),
      restaurarDemonstracao: () => setState(resetState("seed")),
      limparDados: () => setState(resetState("empty")),
    };
  }, [update]);

  const value = useMemo(() => ({ state, hydrated, ...api }), [state, hydrated, api]);

  return <MordomoContext.Provider value={value}>{children}</MordomoContext.Provider>;
}

export function useMordomo() {
  const ctx = useContext(MordomoContext);
  if (!ctx) throw new Error("useMordomo precisa estar dentro de MordomoProvider");
  return ctx;
}

export function useMesReferencia() {
  const { state, setConfiguracoes } = useMordomo();
  return [state.configuracoes.mesReferencia, (ym) => setConfiguracoes({ mesReferencia: ym })];
}
