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

export function setAuth(accessToken: string, user: AuthUser) {
  window.localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
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
  if (!window.location.pathname.startsWith(redirectTo)) {
    window.location.assign(redirectTo);
  }
}

export function logout(redirectTo = "/login") {
  clearAuth();
  if (typeof window === "undefined") return;
  window.location.assign(redirectTo);
}
