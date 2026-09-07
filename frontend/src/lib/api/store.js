// Single swappable data layer.
// Today: browser storage + locally generated evaluation.
// Later: replace each function body with a `fetch(API_BASE_URL + ...)` call
// to the Spring Boot backend. UI code never changes.

export const API_BASE_URL = "";

const PREFIX = "hiresense:";

export function readStore(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function removeStore(key) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PREFIX + key);
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
