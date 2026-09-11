import { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Hourglass,
  TrendingDown,
  Target,
  Landmark,
  HandHeart,
  History,
  PieChart,
  Tags,
  Wallet,
  CalendarDays,
  Settings,
  ChevronDown,
  Lightbulb,
} from "lucide-react";
import { PageHeader, Card } from "../components/mordomo/ui";

const SECOES = [
  {
    icon: LayoutDashboard,
    titulo: "Visão Geral",
    resumo: "O painel principal do Mordomo: o resumo do seu mês em um só lugar.",
    itens: [
      "Aqui você vê o total de receitas, despesas, saldo do mês e os principais gráficos.",
      "O card “Recebimentos futuros” mostra o que você ainda espera receber — esse valor fica separado e NÃO entra no seu saldo disponível.",
      "Use o seletor de mês (no topo, ao lado do seu nome) para navegar entre meses anteriores e futuros.",
    ],
  },
  {
    icon: TrendingUp,
    titulo: "Receitas",
    resumo: "Todo dinheiro que entra: salário, vendas, freelas e outras entradas.",
    itens: [
      "Clique em “+ Nova receita” para registrar uma entrada. Informe descrição, valor, categoria e data.",
      "Uma receita registrada soma imediatamente no seu saldo do mês.",
      "Use o campo de busca e os filtros para encontrar lançamentos antigos.",
    ],
  },
  {
    icon: Hourglass,
    titulo: "Recebimentos Futuros",
    resumo: "Valores que você espera receber, mas que ainda não caíram na conta.",
    itens: [
      "Cadastre recebimentos esperados com descrição, valor e, se quiser, uma data prevista (opcional).",
      "Enquanto estiver “pendente”, o valor fica visível na Visão Geral como expectativa, sem afetar o saldo.",
      "Quando o dinheiro chegar, clique em “Recebi”: o recebimento vira uma receita de verdade e passa a somar no saldo.",
      "A confirmação é idempotente: clicar duas vezes não duplica a receita.",
      "Recebimentos com data prevista aparecem também no Calendário, com destaque tracejado.",
    ],
  },
  {
    icon: TrendingDown,
    titulo: "Despesas",
    resumo: "Todo dinheiro que sai: contas, compras, assinaturas e gastos do dia a dia.",
    itens: [
      "Clique em “+ Nova despesa” e preencha descrição, valor, categoria, data e forma de pagamento.",
      "Marque despesas como “fixas” para identificar seus custos recorrentes.",
      "Acompanhe o status (pago ou pendente) para não perder nenhum vencimento.",
    ],
  },
  {
    icon: Target,
    titulo: "Planejamento",
    resumo: "Defina limites de gastos por categoria e acompanhe o progresso.",
    itens: [
      "Estabeleça quanto pretende gastar por categoria no mês.",
      "As barras de progresso mostram o quanto já foi usado: verde é tranquilo, atenção acima de 85%.",
      "Ajuste os limites quando quiser — o planejamento é seu companheiro, não um juiz.",
    ],
  },
  {
    icon: Landmark,
    titulo: "Dívidas",
    resumo: "Controle empréstimos, parcelas e o quanto já foi quitado.",
    itens: [
      "Cadastre cada dívida com valor total, parcelas e vencimentos.",
      "Registre pagamentos para acompanhar a evolução da quitação.",
      "Veja o progresso de cada dívida em barras visuais.",
    ],
  },
  {
    icon: HandHeart,
    titulo: "Dízimos e Ofertas",
    resumo: "Separe e registre suas contribuições com propósito.",
    itens: [
      "Registre dízimos e ofertas com data, valor e observação.",
      "Acompanhe o histórico das suas contribuições ao longo dos meses.",
    ],
  },
  {
    icon: History,
    titulo: "Histórico",
    resumo: "Todos os seus lançamentos em ordem cronológica.",
    itens: [
      "Veja tudo o que foi registrado, mês a mês.",
      "Use os filtros para localizar um lançamento específico.",
    ],
  },
  {
    icon: PieChart,
    titulo: "Relatórios",
    resumo: "Gráficos e comparações para entender seus hábitos financeiros.",
    itens: [
      "Compare receitas e despesas dos últimos meses.",
      "Veja a distribuição dos gastos por categoria.",
      "Analise a evolução do seu saldo e da sua taxa de economia.",
    ],
  },
  {
    icon: Tags,
    titulo: "Categorias",
    resumo: "Organize seus lançamentos em categorias personalizadas.",
    itens: [
      "Crie, edite e remova categorias de receitas e despesas.",
      "Categorias bem definidas deixam os relatórios muito mais úteis.",
    ],
  },
  {
    icon: Wallet,
    titulo: "Contas",
    resumo: "Cadastre suas contas bancárias, carteiras e cartões.",
    itens: [
      "Registre suas contas e acompanhe o saldo de cada uma.",
      "Vincule lançamentos às contas para saber onde está cada centavo.",
    ],
  },
  {
    icon: CalendarDays,
    titulo: "Calendário",
    resumo: "Uma visão mensal de tudo o que acontece (e vai acontecer) nas suas finanças.",
    itens: [
      "Despesas, receitas, compromissos fixos e recebimentos futuros com data aparecem no dia correspondente.",
      "Recebimentos futuros aparecem com destaque tracejado dourado.",
      "Use as setas para navegar entre os meses.",
    ],
  },
  {
    icon: Settings,
    titulo: "Configurações",
    resumo: "Personalize o Mordomo do seu jeito.",
    itens: [
      "Altere seu nome e o versículo exibido na barra lateral.",
      "Gerencie seus dados: os registros ficam salvos no seu próprio navegador.",
    ],
  },
];

const DICAS = [
  "Seus dados ficam salvos no navegador: você pode fechar a página e tudo estará lá quando voltar.",
  "Cadastre primeiro suas contas e categorias — isso facilita todos os lançamentos depois.",
  "Revise a Visão Geral no início de cada mês para planejar com clareza.",
  "Use Recebimentos Futuros para o dinheiro esperado e só confirme com “Recebi” quando ele realmente chegar.",
];

function Secao({ secao, aberta, onToggle }) {
  const Icon = secao.icon;
  return (
    <div className="md-card" style={{ padding: 0, overflow: "hidden" }}>
      <button
        className="md-help-head"
        onClick={onToggle}
        aria-expanded={aberta}
      >
        <span className={`md-stat-icon md-tone-green`} style={{ width: 36, height: 36 }}>
          <Icon size={17} strokeWidth={1.7} />
        </span>
        <span style={{ flex: 1, textAlign: "left" }}>
          <span className="md-help-title">{secao.titulo}</span>
          <span className="md-help-resumo">{secao.resumo}</span>
        </span>
        <ChevronDown
          size={17}
          style={{
            transition: "transform .2s ease",
            transform: aberta ? "rotate(180deg)" : "none",
            flexShrink: 0,
            color: "var(--md-muted)",
          }}
        />
      </button>
      {aberta ? (
        <div className="md-help-body">
          <ul>
            {secao.itens.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function ComoUsar() {
  const [aberta, setAberta] = useState(0);

  return (
    <div className="md-page">
      <PageHeader
        title="Como usar o Mordomo"
        subtitle="Um guia simples para você aproveitar cada parte da ferramenta — gestão com propósito."
      />

      <div className="md-grid" style={{ gridTemplateColumns: "1fr", gap: 16 }}>
        <Card title="Primeiros passos">
          <ol className="md-help-steps">
            <li>
              <strong>1. Configure seu perfil</strong> — vá em Configurações e ajuste seu nome e
              versículo preferido.
            </li>
            <li>
              <strong>2. Cadastre contas e categorias</strong> — elas são a base de todos os
              lançamentos.
            </li>
            <li>
              <strong>3. Registre receitas e despesas</strong> — cada lançamento alimenta os
              gráficos e relatórios automaticamente.
            </li>
            <li>
              <strong>4. Planeje o mês</strong> — defina limites por categoria no Planejamento e
              acompanhe as barras de progresso.
            </li>
            <li>
              <strong>5. Revise na Visão Geral</strong> — volte sempre ao painel para enxergar o
              mês com clareza.
            </li>
          </ol>
        </Card>

        <Card title="Guia de cada seção" className="md-help-card">
          <p className="md-mute-xs" style={{ margin: "0 0 12px" }}>
            Toque em uma seção para abrir a explicação.
          </p>
          <div className="md-help-list">
            {SECOES.map((secao, i) => (
              <Secao
                key={secao.titulo}
                secao={secao}
                aberta={aberta === i}
                onToggle={() => setAberta(aberta === i ? -1 : i)}
              />
            ))}
          </div>
        </Card>

        <Card title="Boas práticas de mordomia">
          <ul className="md-help-tips">
            {DICAS.map((dica, i) => (
              <li key={i}>
                <Lightbulb size={15} strokeWidth={1.7} />
                <span>{dica}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
