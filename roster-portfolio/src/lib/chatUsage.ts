export const CHAT_LIMIT = 10;
export const CHAT_USAGE_EVENT = "portfolio-chat-usage";
export const CHAT_USAGE_STORAGE_KEY = "portfolio-chat-remaining";
export const CHAT_BROWSER_ID_STORAGE_KEY = "portfolio-chat-browser-id";

type StoredUsage = {
  remaining: number;
  resetAt?: number;
};

export function readStoredRemaining() {
  if (typeof window === "undefined") return CHAT_LIMIT;

  const stored = window.localStorage.getItem(CHAT_USAGE_STORAGE_KEY);
  if (stored === null) return CHAT_LIMIT;

  try {
    const parsed = JSON.parse(stored) as StoredUsage;
    if (parsed.resetAt && parsed.resetAt <= Date.now()) return CHAT_LIMIT;
    return Number.isFinite(parsed.remaining) ? Math.max(0, Math.min(CHAT_LIMIT, parsed.remaining)) : CHAT_LIMIT;
  } catch {
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(CHAT_LIMIT, parsed)) : CHAT_LIMIT;
  }
}

export function publishRemainingTurns(remaining: number, resetSeconds?: number) {
  if (typeof window === "undefined") return;

  const normalized = Math.max(0, Math.min(CHAT_LIMIT, remaining));
  const resetAt = resetSeconds && resetSeconds > 0 ? Date.now() + resetSeconds * 1000 : undefined;
  window.localStorage.setItem(CHAT_USAGE_STORAGE_KEY, JSON.stringify({ remaining: normalized, resetAt }));
  window.dispatchEvent(new CustomEvent(CHAT_USAGE_EVENT, { detail: normalized }));
}

export function readChatBrowserId() {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(CHAT_BROWSER_ID_STORAGE_KEY);
  if (existing) return existing;

  const generated =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(CHAT_BROWSER_ID_STORAGE_KEY, generated);
  return generated;
}

export function chatRequestHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Portfolio-Chat-Session": readChatBrowserId(),
  };
}
