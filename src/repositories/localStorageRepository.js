import { buildSeedState, buildEmptyState } from "../data/seed";

const STORAGE_KEY = "mordomo.v1";

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
    return { ...buildEmptyState(), ...JSON.parse(raw) };
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
