import { cleanupUnauthorized } from "@/lib/auth";
import { STORAGE_KEYS, type ApiDataResponse, type ApiErrorResponse } from "@/lib/types";

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  accessToken?: string | null;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.bolomj.space";
  return raw.replace(/\/+$/, "");
}

export function unwrapApiResponse<T>(payload: T | ApiDataResponse<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "data" in payload
  ) {
    return (payload as ApiDataResponse<T>).data;
  }

  return payload as T;
}

function browserToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEYS.accessToken);
}

export async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function validationMessage(errors: unknown) {
  if (!errors) return null;
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) return errors.filter(Boolean).join(", ");
  if (typeof errors !== "object") return null;

  return Object.entries(errors as Record<string, unknown>)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
      if (typeof value === "string") return `${key}: ${value}`;
      return null;
    })
    .filter(Boolean)
    .join("; ");
}

function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const apiError = payload as ApiErrorResponse;
    const details = validationMessage(apiError.errors);
    const message = apiError.message || apiError.error || fallback;
    return details ? `${message}: ${details}` : message;
  }

  if (typeof payload === "string" && payload.trim()) return payload;
  return fallback;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}) {
  const { body, headers, auth, accessToken, ...init } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");

  const token = accessToken ?? (auth ? browserToken() : null);
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: requestHeaders,
  });

  const payload = await safeJson(response);

  if (!response.ok) {
    if (response.status === 401) cleanupUnauthorized();
    throw new ApiError(
      errorMessage(payload, `Request failed with status ${response.status}`),
      response.status,
      payload,
    );
  }

  return unwrapApiResponse<T>(payload as T | ApiDataResponse<T>);
}
