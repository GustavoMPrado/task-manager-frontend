import { useEffect, useState } from "react";
import { listTasks, createTask, deleteTask, updateTask, patchTask } from "../api/taskApi";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [sort, setSort] = useState("id,desc");

  async function load(customPage = page) {
    try {
      setError("");
      setLoadingList(true);

      const data = await listTasks({ page: customPage, size, sort });
      const items = Array.isArray(data) ? data : (data?.content ?? []);
      setTasks(items);

      if (!Array.isArray(data)) {
        const tp = Number(data?.page?.totalPages ?? data?.totalPages ?? 0);
        setTotalPages(tp);
        setPage(Number(data?.page?.number ?? customPage));
      } else {
        setTotalPages(0);
        setPage(customPage);
      }
    } catch (err) {
      setError("Falha ao buscar tarefas (GET /tasks). Veja o console (F12).");
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sort]);

  async function handleCreate(payload) {
    try {
      setError("");
      await createTask(payload);
      setEditingTask(null);
      setPage(0);
      await load(0);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Falha ao criar tarefa (POST /tasks). Veja o console (F12).";
      setError(msg);
      console.error(err);
      throw err;
    }
  }

  async function handleUpdate(id, payload) {
    try {
      setError("");
      await updateTask(id, payload);
      setEditingTask(null);
      await load(page);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Falha ao atualizar tarefa (PUT /tasks/{id}). Veja o console (F12).";
      setError(msg);
      console.error(err);
      throw err;
    }
  }

  async function handleDelete(id) {
    try {
      setError("");
      await deleteTask(id);

      if (editingTask?.id === id) setEditingTask(null);

      const remaining = tasks.length - 1;
      const shouldGoPrev = remaining <= 0 && page > 0;

      if (shouldGoPrev) {
        setPage((p) => Math.max(0, p - 1));
      } else {
        await load(page);
      }
    } catch (err) {
      setError("Falha ao excluir (DELETE /tasks/{id}). Veja o console (F12).");
      console.error(err);
      throw err;
    }
  }

  async function handlePatchStatus(id, newStatus) {
    const prevTask = tasks.find((t) => t.id === id);
    if (!prevTask || prevTask.status === newStatus) return;

    try {
      setError("");
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
      await patchTask(id, { status: newStatus });
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: prevTask.status } : t))
      );

      const msg =
        err?.response?.data?.message ||
        "Falha ao atualizar status (PATCH /tasks/{id}). Veja o console (F12).";
      setError(msg);
      console.error(err);
      throw err;
    }
  }

  async function handlePatchPriority(id, newPriority) {
    const prevTask = tasks.find((t) => t.id === id);
    if (!prevTask || prevTask.priority === newPriority) return;

    try {
      setError("");
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority: newPriority } : t)));
      await patchTask(id, { priority: newPriority });
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, priority: prevTask.priority } : t))
      );

      const msg =
        err?.response?.data?.message ||
        "Falha ao atualizar prioridade (PATCH /tasks/{id}). Veja o console (F12).";
      setError(msg);
      console.error(err);
      throw err;
    }
  }

  function handleEdit(task) {
    setError("");
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingTask(null);
  }

  function goPrev() {
    setPage((p) => Math.max(0, p - 1));
  }

  function goNext() {
    setPage((p) => (totalPages ? Math.min(totalPages - 1, p + 1) : p + 1));
  }

  function handleChangeSize(e) {
    const newSize = Number(e.target.value);
    setSize(newSize);
    setPage(0);
  }

  function handleChangeSort(e) {
    setSort(e.target.value);
    setPage(0);
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 48, marginBottom: 24 }}>Task Manager Frontend</h1>

      {error && (
        <div style={{ margin: "12px 0", padding: 12, border: "1px solid #a33", borderRadius: 8 }}>
          {error}
        </div>
      )}

      <TaskForm
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        editingTask={editingTask}
        onCancelEdit={handleCancelEdit}
        setError={setError}
      />

      <hr style={{ margin: "24px 0" }} />

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Tamanho</span>
          <select value={size} onChange={handleChangeSize}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Ordenação</span>
          <select value={sort} onChange={handleChangeSort}>
            <option value="id,desc">Mais novas (id desc)</option>
            <option value="id,asc">Mais antigas (id asc)</option>
            <option value="title,asc">Título (A–Z)</option>
            <option value="title,desc">Título (Z–A)</option>
            <option value="dueDate,asc">Vencimento (asc)</option>
            <option value="dueDate,desc">Vencimento (desc)</option>
          </select>
        </label>
      </div>

      <TaskList
        tasks={tasks}
        loadingList={loadingList}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onPatchStatus={handlePatchStatus}
        onPatchPriority={handlePatchPriority}
        page={page}
        totalPages={totalPages}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  );
}





