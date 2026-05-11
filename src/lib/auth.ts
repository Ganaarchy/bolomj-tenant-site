import type { AuthUser } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/types";

export const AUTH_CHANGE_EVENT = "bolomj-auth-change";

function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearAuth();
    return null;
  }
}

export function getCurrentReturnTo() {
  if (typeof window === "undefined") return "";

  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (!returnTo || returnTo.startsWith("/login")) return "";

  return returnTo;
}

export function loginPathWithReturnTo(returnTo = getCurrentReturnTo()) {
  return returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";
}

export function setAuth(accessToken: string, user: AuthUser) {
  window.localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  notifyAuthChanged();
}

export function setStoredUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  notifyAuthChanged();
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.accessToken);
  window.localStorage.removeItem(STORAGE_KEYS.user);
  notifyAuthChanged();
}

export function cleanupUnauthorized(redirectTo = "/login") {
  clearAuth();

  if (typeof window === "undefined") return;
  if (!window.location.pathname.startsWith("/login")) {
    const target = redirectTo === "/login" ? loginPathWithReturnTo() : redirectTo;
    window.location.assign(target);
  }
}

export function logout(redirectTo = "/login") {
  clearAuth();
  if (typeof window === "undefined") return;
  window.location.assign(redirectTo);
}
