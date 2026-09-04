import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Inbox, X } from "lucide-react";
import { monthLabel, addMonths, formatBRL } from "../../utils/format";
import { useMesReferencia } from "../../hooks/useMordomo";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="md-card-head" style={{ marginBottom: 4, flexWrap: "wrap" }}>
      <div>
        <h1 className="md-page-title">{title}</h1>
        {subtitle ? <p className="md-page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div> : null}
    </div>
  );
}

export function Card({ title, action, children, className = "", style }) {
  return (
    <section className={`md-card ${className}`} style={style}>
      {title || action ? (
        <div className="md-card-head">
          <h3 className="md-section-title">{title}</h3>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({ icon, tone = "green", label, value, delta, hint }) {
  return (
    <div className="md-card">
      <div className="md-stat-head">
        <div className={`md-stat-icon md-tone-${tone}`}>{icon}</div>
        <span className="md-label">{label}</span>
      </div>
      <div className="md-value">{typeof value === "number" ? formatBRL(value) : value}</div>
      {delta !== undefined && delta !== null ? (
        <div className={`md-delta ${delta >= 0 ? "md-pos" : "md-neg"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% vs. mês anterior
        </div>
      ) : null}
      {hint ? <div className="md-mute-xs" style={{ marginTop: 8 }}>{hint}</div> : null}
    </div>
  );
}

export function Modal({ open, title, description, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="md-modal-backdrop" onClick={onClose}>
      <div className="md-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="md-modal-head">
          <div>
            <h3 className="md-display" style={{ fontSize: 18 }}>
              {title}
            </h3>
            {description ? <p className="md-page-subtitle">{description}</p> : null}
          </div>
          <button className="md-button-icon" onClick={onClose} aria-label="Fechar">
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, error, children, span }) {
  return (
    <div className={`md-field ${span ? "md-span-2" : ""}`}>
      <label>{label}</label>
      {children}
      {error ? <span className="md-field-error">{error}</span> : null}
    </div>
  );
}

export function Tabs({ items, value, onChange }) {
  return (
    <div className="md-tabs">
      {items.map((item) => (
        <button
          key={item.value}
          className={`md-tab ${value === item.value ? "is-active" : ""}`}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="md-empty">
      <Inbox size={26} strokeWidth={1.5} />
      <h4>{title}</h4>
      <p>{message}</p>
      {action ? <div style={{ marginTop: 16 }}>{action}</div> : null}
    </div>
  );
}

export function MonthSelector() {
  const [mes, setMes] = useMesReferencia();
  return (
    <div className="md-month">
      <button onClick={() => setMes(addMonths(mes, -1))} aria-label="Mês anterior">
        <ChevronLeft size={16} />
      </button>
      <span>{monthLabel(mes)}</span>
      <button onClick={() => setMes(addMonths(mes, 1))} aria-label="Mês seguinte">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export function Progress({ value }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  const state = pct > 100 ? "is-over" : pct > 85 ? "is-warn" : "";
  return (
    <div className={`md-progress ${state}`}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Badge({ tone = "neutral", children }) {
  return <span className={`md-badge md-badge-${tone}`}>{children}</span>;
}

export function useToast() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (!msg) return undefined;
    const t = setTimeout(() => setMsg(null), 2400);
    return () => clearTimeout(t);
  }, [msg]);
  const node = msg ? <div className="md-toast">{msg}</div> : null;
  return [node, setMsg];
}
