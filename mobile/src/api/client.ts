import type { Title, TitleInput, TvmazeResult, User } from "./types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError("Ingen anslutning till servern", 0);
  }
  let data: any = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    throw new ApiError(data?.error || `Fel ${res.status}`, res.status);
  }
  return data as T;
}

export const api = {
  register: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/register", { method: "POST", body: { email, password } }),
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: { email, password } }),
  me: (token: string) => request<{ user: User }>("/api/auth/me", { token }),
  listTitles: (token: string) => request<{ titles: Title[] }>("/api/titles", { token }),
  getTitle: (token: string, id: number) => request<{ title: Title }>(`/api/titles/${id}`, { token }),
  createTitle: (token: string, input: TitleInput) =>
    request<{ title: Title }>("/api/titles", { method: "POST", body: input, token }),
  updateTitle: (token: string, id: number, input: TitleInput) =>
    request<{ title: Title }>(`/api/titles/${id}`, { method: "PUT", body: input, token }),
  deleteTitle: (token: string, id: number) =>
    request<null>(`/api/titles/${id}`, { method: "DELETE", token }),
  randomTitle: (token: string, params: { genre?: string; maxRuntime?: number }) => {
    const search = new URLSearchParams();
    if (params.genre) search.set("genre", params.genre);
    if (params.maxRuntime) search.set("maxRuntime", String(params.maxRuntime));
    const qs = search.toString();
    return request<{ title: Title }>(`/api/titles/random${qs ? `?${qs}` : ""}`, { token });
  },
  searchTvmaze: (token: string, q: string) =>
    request<{ results: TvmazeResult[] }>(`/api/tvmaze/search?q=${encodeURIComponent(q)}`, { token })
};
