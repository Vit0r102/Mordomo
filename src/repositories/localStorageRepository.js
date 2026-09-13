import { buildSeedState, buildEmptyState } from "../data/seed";
import { currentMonthKey } from "../utils/format";

const STORAGE_KEY = "mordomo.v1";

/**
 * Compatibilidade com dados antigos: garante os campos novos sem inventar datas
 * e define o mês de referência inicial como o mês atual do sistema.
 */
function migrar(state) {
  return {
    ...state,
    recebimentosFuturos: (state.recebimentosFuturos || []).map((r) => ({
      ...r,
      dataTrabalho: r.dataTrabalho ?? null,
      dataPrevista: r.dataPrevista ?? null,
    })),
    configuracoes: { ...state.configuracoes, mesReferencia: currentMonthKey() },
  };
}

function isBrowser() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadState() {
  if (!isBrowser()) return buildSeedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = buildSeedState();
      saveState(seeded);
      return seeded;
    }
    return migrar({ ...buildEmptyState(), ...JSON.parse(raw) });
  } catch {
    return buildSeedState();
  }
}

export function saveState(state) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* armazenamento indisponível */
  }
}

export function resetState(mode = "seed") {
  const next = mode === "seed" ? buildSeedState() : buildEmptyState();
  saveState(next);
  return next;
}
