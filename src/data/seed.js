import { uid } from "../utils/format";

export const CURRENT_MONTH = "2026-07";

export const categorias = [
  { id: "cat_moradia", nome: "Moradia", tipo: "despesa", cor: "#1f4d3a" },
  { id: "cat_alimentacao", nome: "Alimentação", tipo: "despesa", cor: "#4c8c6b" },
  { id: "cat_transporte", nome: "Transporte", tipo: "despesa", cor: "#7fae92" },
  { id: "cat_saude", nome: "Saúde", tipo: "despesa", cor: "#b4553f" },
  { id: "cat_lazer", nome: "Lazer", tipo: "despesa", cor: "#c9a15a" },
  { id: "cat_educacao", nome: "Educação", tipo: "despesa", cor: "#8a8f7d" },
  { id: "cat_religioso", nome: "Dízimos e Ofertas", tipo: "despesa", cor: "#a58a4e" },
  { id: "cat_dividas", nome: "Dívidas", tipo: "despesa", cor: "#6d6a60" },
  { id: "cat_outros", nome: "Outros", tipo: "despesa", cor: "#b8b3a6" },
  { id: "cat_salario", nome: "Salário", tipo: "receita", cor: "#2f6b4f" },
  { id: "cat_extra", nome: "Renda Extra", tipo: "receita", cor: "#6fa286" },
];

export const tiposDinheiro = [
  { id: "tip_conta", nome: "Conta bancária" },
  { id: "tip_pix", nome: "Pix" },
  { id: "tip_dinheiro", nome: "Dinheiro" },
  { id: "tip_cartao", nome: "Cartão" },
];

export const contas = [
  { id: "con_principal", nome: "Conta Principal", tipo: "Conta bancária", saldoInicial: 7310 },
  { id: "con_carteira", nome: "Carteira", tipo: "Dinheiro", saldoInicial: 320 },
  { id: "con_cartao", nome: "Cartão de Crédito", tipo: "Cartão", saldoInicial: 0 },
  { id: "con_reserva", nome: "Reserva de Emergência", tipo: "Conta bancária", saldoInicial: 24500 },
];

const RECEITA_BASE = [
  { ym: "2026-02", salario: 14200, extra: 1100 },
  { ym: "2026-03", salario: 14200, extra: 2400 },
  { ym: "2026-04", salario: 14800, extra: 1600 },
  { ym: "2026-05", salario: 14800, extra: 2900 },
  { ym: "2026-06", salario: 14800, extra: 1680 },
  { ym: "2026-07", salario: 15000, extra: 3540 },
];

const DESPESA_BASE = {
  "2026-02": 9860,
  "2026-03": 10420,
  "2026-04": 9980,
  "2026-05": 11040,
  "2026-06": 10664,
  "2026-07": 11230,
};

const DISTRIBUICAO = [
  { categoriaId: "cat_moradia", peso: 0.289, descricao: "Aluguel" },
  { categoriaId: "cat_alimentacao", peso: 0.191, descricao: "Supermercado" },
  { categoriaId: "cat_transporte", peso: 0.119, descricao: "Combustível" },
  { categoriaId: "cat_saude", peso: 0.1, descricao: "Plano de Saúde" },
  { categoriaId: "cat_lazer", peso: 0.087, descricao: "Lazer da família" },
  { categoriaId: "cat_religioso", peso: 0.121, descricao: "Dízimo" },
  { categoriaId: "cat_dividas", peso: 0.054, descricao: "Pagamento de dívida" },
  { categoriaId: "cat_outros", peso: 0.039, descricao: "Outros gastos" },
];

function buildReceitas() {
  const out = [];
  RECEITA_BASE.forEach(({ ym, salario, extra }) => {
    out.push({
      id: uid("rec"),
      descricao: "Salário",
      valor: salario,
      categoriaId: "cat_salario",
      tipoDinheiroId: "tip_conta",
      contaId: "con_principal",
      data: `${ym}-05`,
      observacao: "",
    });
    out.push({
      id: uid("rec"),
      descricao: "Renda extra",
      valor: extra,
      categoriaId: "cat_extra",
      tipoDinheiroId: "tip_pix",
      contaId: "con_principal",
      data: `${ym}-18`,
      observacao: "",
    });
  });
  return out;
}

function buildDespesas() {
  const out = [];
  Object.entries(DESPESA_BASE).forEach(([ym, total]) => {
    DISTRIBUICAO.forEach((item, index) => {
      out.push({
        id: uid("des"),
        descricao: item.descricao,
        valor: Math.round(total * item.peso),
        categoriaId: item.categoriaId,
        tipoDinheiroId: item.categoriaId === "cat_alimentacao" ? "tip_cartao" : "tip_conta",
        contaId: "con_principal",
        data: `${ym}-${String(4 + index * 3).padStart(2, "0")}`,
        observacao: "",
        dividaId: item.categoriaId === "cat_dividas" ? "div_carro" : null,
        origem: item.categoriaId === "cat_religioso" ? "dizimo" : "manual",
      });
    });
  });
  return out;
}

export const planejamentos = [
  {
    id: "pl_aluguel",
    nome: "Aluguel",
    tipo: "Conta Fixa",
    regra: "valor_fixo",
    valor: 1000,
    percentual: null,
    frequencia: "Mensal",
    periodo: CURRENT_MONTH,
    categoriaId: "cat_moradia",
  },
  {
    id: "pl_carro",
    nome: "Financiamento Carro",
    tipo: "Dívida",
    regra: "valor_definido",
    valor: 600,
    percentual: null,
    frequencia: "Mensal",
    periodo: CURRENT_MONTH,
    categoriaId: "cat_dividas",
  },
  {
    id: "pl_combustivel",
    nome: "Combustível",
    tipo: "Gasto",
    regra: "limite",
    valor: 500,
    percentual: null,
    frequencia: "Mensal",
    periodo: CURRENT_MONTH,
    categoriaId: "cat_transporte",
  },
  {
    id: "pl_dizimo",
    nome: "Dízimo",
    tipo: "Religioso",
    regra: "porcentagem",
    valor: null,
    percentual: 10,
    frequencia: "Mensal",
    periodo: CURRENT_MONTH,
    categoriaId: "cat_religioso",
  },
  {
    id: "pl_oferta",
    nome: "Oferta",
    tipo: "Religioso",
    regra: "valor_fixo",
    valor: 300,
    percentual: null,
    frequencia: "Mensal",
    periodo: CURRENT_MONTH,
    categoriaId: "cat_religioso",
  },
];

export const dividas = [
  {
    id: "div_carro",
    nome: "Financiamento Carro",
    valorTotal: 18000,
    pagamentoPlanejado: 600,
    proximoPagamento: "2026-07-20",
    pagamentos: [
      { id: uid("pag"), valor: 3150, data: "2026-04-20" },
      { id: uid("pag"), valor: 1200, data: "2026-05-20" },
      { id: uid("pag"), valor: 1200, data: "2026-06-20" },
    ],
  },
  {
    id: "div_cartao",
    nome: "Cartão de Crédito",
    valorTotal: 5000,
    pagamentoPlanejado: 400,
    proximoPagamento: "2026-07-10",
    pagamentos: [
      { id: uid("pag"), valor: 900, data: "2026-05-10" },
      { id: uid("pag"), valor: 900, data: "2026-06-10" },
    ],
  },
  {
    id: "div_pessoal",
    nome: "Empréstimo Pessoal",
    valorTotal: 8000,
    pagamentoPlanejado: 350,
    proximoPagamento: "2026-07-15",
    pagamentos: [
      { id: uid("pag"), valor: 2750, data: "2026-05-15" },
      { id: uid("pag"), valor: 2400, data: "2026-06-15" },
    ],
  },
];

export const pagamentosFixos = [
  { id: "fx_energia", nome: "Energia", valor: 220, diaVencimento: 18, categoriaId: "cat_moradia" },
  { id: "fx_internet", nome: "Internet", valor: 129.9, diaVencimento: 18, categoriaId: "cat_moradia" },
  { id: "fx_saude", nome: "Plano de Saúde", valor: 450, diaVencimento: 25, categoriaId: "cat_saude" },
  { id: "fx_aluguel", nome: "Aluguel", valor: 1000, diaVencimento: 15, categoriaId: "cat_moradia" },
];

export const patrimonio = [
  { id: "pat_imovel", nome: "Imóvel", valor: 120000 },
  { id: "pat_veiculo", nome: "Veículo", valor: 32480 },
  { id: "pat_reserva", nome: "Reserva", valor: 4300 },
];

export const recebimentosFuturos = [
  {
    id: "rf_projeto",
    descricao: "Saldo do projeto de consultoria",
    valor: 800,
    categoriaId: "cat_extra",
    dataPrevista: "2026-07-22",
    observacao: "R$ 200 recebidos na assinatura do contrato.",
    recebido: false,
    receitaId: null,
    dataRecebimento: null,
  },
  {
    id: "rf_freela",
    descricao: "Segunda parcela do freelance",
    valor: 480,
    categoriaId: "cat_extra",
    dataPrevista: null,
    observacao: "Sem data combinada ainda.",
    recebido: false,
    receitaId: null,
    dataRecebimento: null,
  },
];

export function buildSeedState() {
  return {
    usuario: { nome: "João Oliveira", versiculo: "Colossenses 3.23" },
    categorias,
    tiposDinheiro,
    contas,
    receitas: buildReceitas(),
    despesas: buildDespesas(),
    planejamentos,
    dividas,
    pagamentosFixos,
    patrimonio,
    recebimentosFuturos,
    configuracoes: { mesReferencia: CURRENT_MONTH, mostrarMensagens: true, percentualDizimo: 10 },
  };
}

export function buildEmptyState() {
  return {
    usuario: { nome: "Você", versiculo: "Colossenses 3.23" },
    categorias,
    tiposDinheiro,
    contas: [],
    receitas: [],
    despesas: [],
    planejamentos: [],
    dividas: [],
    pagamentosFixos: [],
    patrimonio: [],
    recebimentosFuturos: [],
    configuracoes: { mesReferencia: CURRENT_MONTH, mostrarMensagens: true, percentualDizimo: 10 },
  };
}

