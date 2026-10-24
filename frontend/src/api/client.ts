/** Cliente da API: token JWT + modo demonstração quando não há backend. */
const BASE = (import.meta.env.VITE_API_BASE as string | undefined) || "";

export const demoMode = !BASE;

export function getToken(): string {
  return localStorage.getItem("token") || "";
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function logout(): void {
  localStorage.removeItem("token");
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (demoMode) {
    throw new ApiError(
      0,
      "Modo demonstração: nenhum backend configurado (defina VITE_API_BASE).",
    );
  }
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      response.status,
      (data as { error?: string }).error || `HTTP ${response.status}`,
    );
  }
  return data as T;
}
