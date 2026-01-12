import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

// GET /tasks (paginado)
export async function listTasks(params = {}) {
  // params pode ter { page, size, sort } depois
  const res = await api.get("/tasks", { params });
  return res.data; // geralmente vem { content: [...], page: {...} }
}

// POST /tasks
export async function createTask(payload) {
  const res = await api.post("/tasks", payload);
  return res.data;
}

// DELETE /tasks/{id}
export async function deleteTask(id) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
}

// PUT /tasks/{id} (atualização completa)
export async function updateTask(id, payload) {
  const res = await api.put(`/tasks/${id}`, payload);
  return res.data;
}

// PATCH /tasks/{id} (atualização parcial)
export async function patchTask(id, payload) {
  const res = await api.patch(`/tasks/${id}`, payload);
  return res.data;
}

// GET /tasks/{id}
export async function getTaskById(id) {
  const res = await api.get(`/tasks/${id}`);
  return res.data;
}


