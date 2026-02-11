import axios from "axios";

export type TaskStatus = "TODO" | "DOING" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PageInfo = {
  totalPages: number;
  number: number;
  totalElements: number;
};

export type PageResponse<T> = {
  content: T[];
  page?: PageInfo;
  totalPages?: number;
  totalElements?: number;
};

export type ListTasksParams = {
  page?: number;
  size?: number;
  sort?: string;
  q?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
};

export type TaskCreatePayload = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
};

export type TaskUpdatePayload = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
};

export type TaskPatchPayload = Partial<
  Pick<Task, "status" | "priority" | "title" | "description" | "dueDate">
>;

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type AiSuggestPriorityPayload = {
  title: string;
  description?: string | null;
};

export type AiSuggestPriorityResponse = {
  priority: TaskPriority;
  reason: string;
};

const DEFAULT_PROD_API_URL = "https://task-manager-api-njza.onrender.com";
const DEFAULT_DEV_API_URL = "/api";

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL);

const AUTH_TOKEN_KEY = "task_manager_token";

export const api = axios.create({ baseURL });

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      clearAuthToken();
    }
    return Promise.reject(err);
  }
);

function cleanParams<T extends Record<string, unknown>>(params: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

function normalizeListTasksResponse(data: unknown): PageResponse<Task> {
  if (Array.isArray(data)) {
    return {
      content: data as Task[],
      page: { totalPages: 1, number: 0, totalElements: data.length },
      totalPages: 1,
      totalElements: data.length,
    };
  }
  return data as PageResponse<Task>;
}

function normalizeTask(t: Task): Task {
  return { ...t, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : null };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post("/auth/login", payload);
  const data = res.data as LoginResponse;
  if (data?.token) setAuthToken(data.token);
  return data;
}

export async function listTasks(
  params: ListTasksParams = {}
): Promise<PageResponse<Task>> {
  const res = await api.get("/tasks", { params: cleanParams(params) });
  const normalized = normalizeListTasksResponse(res.data);
  return { ...normalized, content: normalized.content.map(normalizeTask) };
}

export async function createTask(payload: TaskCreatePayload): Promise<Task> {
  const res = await api.post("/tasks", payload);
  return res.data as Task;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function updateTask(
  id: number,
  payload: TaskUpdatePayload
): Promise<Task> {
  const res = await api.put(`/tasks/${id}`, payload);
  return res.data as Task;
}

export async function patchTask(
  id: number,
  payload: TaskPatchPayload
): Promise<Task> {
  const res = await api.patch(`/tasks/${id}`, payload);
  return res.data as Task;
}

export async function getTaskById(id: number): Promise<Task> {
  const res = await api.get(`/tasks/${id}`);
  return res.data as Task;
}

export async function suggestPriority(
  payload: AiSuggestPriorityPayload
): Promise<AiSuggestPriorityResponse> {
  const res = await api.post("/ai/suggest-priority", payload);
  return res.data as AiSuggestPriorityResponse;
}



