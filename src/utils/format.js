export function formatBRL(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatShortBRL(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1000) return `R$ ${Math.round(n / 1000)}k`;
  return `R$ ${Math.round(n)}`;
}

export function formatPercent(value, digits = 1) {
  const n = Number(value) || 0;
  return `${n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}

export function parseAmount(input) {
  if (typeof input === "number") return input;
  if (!input) return 0;
  const normalized = String(input).replace(/\s|R\$/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function monthLabel(ym) {
  const [y, m] = String(ym).split("-");
  return `${MONTHS[Number(m) - 1]}/${y}`;
}

export function monthShort(ym) {
  const [, m] = String(ym).split("-");
  return MONTHS_SHORT[Number(m) - 1];
}

export function monthKey(iso) {
  return String(iso).slice(0, 7);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addMonths(ym, delta) {
  const [y, m] = String(ym).split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function lastMonths(ym, count) {
  const out = [];
  for (let i = count - 1; i >= 0; i -= 1) out.push(addMonths(ym, -i));
  return out;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export { MONTHS, MONTHS_SHORT };
