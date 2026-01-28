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

const DEFAULT_PROD_API_URL = "https://task-manager-api-njza.onrender.com";
const DEFAULT_DEV_API_URL = "/api";

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL);

export const api = axios.create({ baseURL });

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

