import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Target,
  Landmark,
  HandHeart,
  History,
  Hourglass,

  PieChart,
  Tags,
  Wallet,
  CalendarDays,
  Settings,
  Menu,
  HelpCircle,
  Bell,
  Quote,
  Plus,
  X,
} from "lucide-react";
import { useMordomo } from "../../hooks/useMordomo";
import { greeting } from "../../utils/format";
import { MonthSelector } from "./ui";

export const NAV = [
  { to: "/", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/receitas", label: "Receitas", icon: TrendingUp },
  { to: "/recebimentos-futuros", label: "Recebimentos Futuros", icon: Hourglass },

  { to: "/despesas", label: "Despesas", icon: TrendingDown },
  { to: "/planejamento", label: "Planejamento", icon: Target },
  { to: "/dividas", label: "Dívidas", icon: Landmark },
  { to: "/contribuicoes", label: "Dízimos e Ofertas", icon: HandHeart },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/relatorios", label: "Relatórios", icon: PieChart },
  { to: "/categorias", label: "Categorias", icon: Tags },
  { to: "/contas", label: "Contas", icon: Wallet },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
  { to: "/como-usar", label: "Como Usar", icon: HelpCircle },
];

const MOBILE = ["/", "/receitas", "/despesas", "/relatorios"];

function initials(nome) {
  return String(nome || "M")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function AppShell({ children }) {
  const { state } = useMordomo();
  const [drawer, setDrawer] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="md-app">
      <aside className="md-sidebar">
        <div className="md-brand">
          <span className="md-brand-mark">
            <Quote size={20} />
          </span>
          <span>
            <span className="md-brand-name">Mordomo</span> <br  />
            <span className="md-brand-tag">Gestão com propósito</span>
          </span>
        </div>

        <nav className="md-nav">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="md-nav-item"
              activeProps={{ className: "md-nav-item is-active" }}
              activeOptions={{ exact: to === "/" }}
            >
              <Icon size={16} strokeWidth={1.7} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="md-verse">
          <div className="md-verse-icon">
            <Quote size={16} />
          </div>
          <p>“E tudo quanto fizerdes, fazei-o de coração, como ao Senhor.”</p>
          <span>{state.usuario.versiculo}</span>
        </div>
      </aside>

      <main className="md-main">
        <header className="md-topbar">
          <div>
            <h2 className="md-display" style={{ fontSize: 18 }}>
              {greeting()}, {String(state.usuario.nome).split(" ")[0]}
            </h2>
            <p className="md-mute-xs" style={{ margin: 0 }}>
              Aqui está a sua mordomia deste mês.
            </p>
          </div>
          <div className="md-topbar-actions">
            <MonthSelector />
            <button className="md-icon-button" aria-label="Notificações">
              <Bell size={15} />
            </button>
            <div className="md-user">
              <span className="md-avatar">{initials(state.usuario.nome)}</span>
              <span>{state.usuario.nome}</span>
            </div>
          </div>
        </header>

        <div className="md-mobile-topbar">
          <button className="md-icon-button" onClick={() => setDrawer(true)} aria-label="Menu">
            <Menu size={16} />
          </button>
          <span className="md-brand-name" style={{ color: "var(--md-green-900)" }}>
            Mordomo
          </span>
          <MonthSelector />
        </div>

        <div className="md-content" key={pathname}>
          {children}
        </div>

        <nav className="md-mobile-nav">
          {MOBILE.slice(0, 2).map((to) => {
            const item = NAV.find((n) => n.to === to);
            const Icon = item.icon;
            return (
              <Link
                key={to}
                to={to}
                activeProps={{ className: "is-active" }}
                activeOptions={{ exact: to === "/" }}
              >
                <Icon size={18} strokeWidth={1.7} />
                {item.label}
              </Link>
            );
          })}
          <Link to="/despesas" className="md-mobile-fab" aria-label="Novo lançamento">
            <Plus size={20} />
          </Link>
          {MOBILE.slice(3).map((to) => {
            const item = NAV.find((n) => n.to === to);
            const Icon = item.icon;
            return (
              <Link key={to} to={to} activeProps={{ className: "is-active" }}>
                <Icon size={18} strokeWidth={1.7} />
                {item.label}
              </Link>
            );
          })}
          <button onClick={() => setDrawer(true)}>
            <Menu size={18} strokeWidth={1.7} />
            Mais
          </button>
        </nav>
      </main>

      {drawer ? (
        <div className="md-mobile-drawer">
          <div className="md-drawer-backdrop" onClick={() => setDrawer(false)} />
          <div className="md-drawer-panel">
            <div className="md-card-head">
              <span className="md-brand-name" style={{ color: "#f4f1e9" }}>
                Mordomo
              </span>
              <button className="md-button-icon" onClick={() => setDrawer(false)} aria-label="Fechar">
                <X size={15} />
              </button>
            </div>
            <nav className="md-nav">
              {NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="md-nav-item"
                  activeProps={{ className: "md-nav-item is-active" }}
                  activeOptions={{ exact: to === "/" }}
                  onClick={() => setDrawer(false)}
                >
                  <Icon size={16} strokeWidth={1.7} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
