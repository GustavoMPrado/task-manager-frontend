import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { createTask, deleteTask, listTasks, patchTask, updateTask } from "../api/taskApi";
import type { Task, TaskCreatePayload, TaskPriority, TaskStatus, TaskUpdatePayload } from "../api/taskApi";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import Toast from "../components/Toast";
import BusyOverlay from "../components/BusyOverlay";

type ToastType = "success" | "error";

type ApiErrorBody = {
  message?: string;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as unknown;

    if (typeof data === "string" && data.trim()) return data;

    if (data && typeof data === "object") {
      const maybe = (data as ApiErrorBody).message;
      if (typeof maybe === "string" && maybe.trim()) return maybe;
    }

    const status = err.response?.status;
    if (status) return `${fallback} (HTTP ${status})`;
  }

  if (err instanceof Error && err.message.trim()) return err.message;

  return fallback;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [sort, setSort] = useState("id,desc");
  const [busy, setBusy] = useState(false);

  const [qInput, setQInput] = useState("");
  const [qApplied, setQApplied] = useState("");

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("");

  const [toast, setToast] = useState<{ open: boolean; message: string; type: ToastType }>({
    open: false,
    message: "",
    type: "success",
  });

  const toastTimerRef = useRef<number | null>(null);

  function showToast(message: string, type: ToastType = "success") {
    setToast({ open: true, message, type });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast((t) => ({ ...t, open: false }));
    }, 3000);
  }

  function closeToast() {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast((t) => ({ ...t, open: false }));
  }

  async function load(customPage = page) {
    try {
      setError("");
      setLoadingList(true);

      const data = await listTasks({
        page: customPage,
        size,
        sort,
        q: qApplied.trim() ? qApplied.trim() : undefined,
        status: statusFilter ? statusFilter : undefined,
        priority: priorityFilter ? priorityFilter : undefined,
      });

      const items = data.content ?? [];
      setTasks(items);

      const tp = Number(data?.page?.totalPages ?? data?.totalPages ?? 0);
      setTotalPages(tp);
      setPage(Number(data?.page?.number ?? customPage));

      const te = Number(data?.page?.totalElements ?? data?.totalElements ?? 0);
      setTotalElements(te);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Falha ao buscar tarefas (GET /tasks).");
      setError(msg);
      showToast(msg, "error");
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    load(page);
  }, [page, size, sort, qApplied, statusFilter, priorityFilter]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  async function handleCreate(payload: TaskCreatePayload) {
    try {
      setBusy(true);
      setError("");
      await createTask(payload);
      setEditingTask(null);
      setPage(0);
      await load(0);
      showToast("Tarefa criada com sucesso!");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Falha ao criar tarefa (POST /tasks).");
      setError(msg);
      showToast(msg, "error");
      console.error(err);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(id: number, payload: TaskUpdatePayload) {
    try {
      setBusy(true);
      setError("");
      await updateTask(id, payload);
      setEditingTask(null);
      await load(page);
      showToast("Alterações salvas!");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Falha ao atualizar tarefa (PUT /tasks/{id}).");
      setError(msg);
      showToast(msg, "error");
      console.error(err);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      setBusy(true);
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

      showToast("Tarefa excluída.");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Falha ao excluir (DELETE /tasks/{id}).");
      setError(msg);
      showToast(msg, "error");
      console.error(err);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function handlePatchStatus(id: number, newStatus: TaskStatus) {
    const prevTask = tasks.find((t) => t.id === id);
    if (!prevTask || prevTask.status === newStatus || busy) return;

    try {
      setBusy(true);
      setError("");
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
      await patchTask(id, { status: newStatus });
      showToast("Status atualizado.");
    } catch (err: unknown) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: prevTask.status } : t)));
      const msg = getErrorMessage(err, "Falha ao atualizar status (PATCH /tasks/{id}).");
      setError(msg);
      showToast(msg, "error");
      console.error(err);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function handlePatchPriority(id: number, newPriority: TaskPriority) {
    const prevTask = tasks.find((t) => t.id === id);
    if (!prevTask || prevTask.priority === newPriority || busy) return;

    try {
      setBusy(true);
      setError("");
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority: newPriority } : t)));
      await patchTask(id, { priority: newPriority });
      showToast("Prioridade atualizada.");
    } catch (err: unknown) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority: prevTask.priority } : t)));
      const msg = getErrorMessage(err, "Falha ao atualizar prioridade (PATCH /tasks/{id}).");
      setError(msg);
      showToast(msg, "error");
      console.error(err);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  function handleEdit(task: Task) {
    if (busy) return;
    setError("");
    setEditingTask({
      ...task,
      description: task.description ?? null,
      dueDate: task.dueDate ?? null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingTask(null);
  }

  function goPrev() {
    if (busy) return;
    setPage((p) => Math.max(0, p - 1));
  }

  function goNext() {
    if (busy) return;
    if (!totalPages || totalPages <= 1) return;
    setPage((p) => Math.min(totalPages - 1, p + 1));
  }

  function handleChangeSize(e: React.ChangeEvent<HTMLSelectElement>) {
    if (busy) return;
    setSize(Number(e.target.value));
    setPage(0);
  }

  function handleChangeSort(e: React.ChangeEvent<HTMLSelectElement>) {
    if (busy) return;
    setSort(e.target.value);
    setPage(0);
  }

  function applySearch() {
    if (busy) return;
    setPage(0);
    setQApplied(qInput);
  }

  function clearFilters() {
    if (busy) return;
    setQInput("");
    setQApplied("");
    setStatusFilter("");
    setPriorityFilter("");
    setPage(0);
  }

  const hasFilters = useMemo(() => {
    return qApplied.trim() !== "" || statusFilter !== "" || priorityFilter !== "";
  }, [qApplied, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const doing = tasks.filter((t) => t.status === "DOING").length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    return { total, todo, doing, done };
  }, [tasks]);

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
      <BusyOverlay open={busy || loadingList} label={busy ? "Processando..." : "Carregando..."} />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />

      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-black/20 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur md:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="m-0 text-4xl font-semibold tracking-tight md:text-5xl">Task Manager</h1>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex min-h-[34px] items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs">
              Total (página): <b>{stats.total}</b>
            </span>
            <span className="inline-flex min-h-[34px] items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs">
              TODO: <b>{stats.todo}</b>
            </span>
            <span className="inline-flex min-h-[34px] items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/15 px-3 py-2 text-xs">
              DOING: <b>{stats.doing}</b>
            </span>
            <span className="inline-flex min-h-[34px] items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-3 py-2 text-xs">
              DONE: <b>{stats.done}</b>
            </span>
            <span className="inline-flex min-h-[34px] items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs">
              Total (busca): <b>{totalElements}</b>
            </span>
          </div>
        </div>

        <div className={`mt-4 flex flex-wrap items-center gap-3 ${busy ? "pointer-events-none opacity-70" : ""}`}>
          <label className="flex items-center gap-2">
            <span className="text-sm opacity-85">Tamanho</span>
            <select
              value={size}
              onChange={handleChangeSize}
              className="rounded-xl border border-white/15 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="text-sm opacity-85">Ordenação</span>
            <select
              value={sort}
              onChange={handleChangeSort}
              className="rounded-xl border border-white/15 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
            >
              <option value="id,desc">Mais novas (id desc)</option>
              <option value="id,asc">Mais antigas (id asc)</option>
              <option value="title,asc">Título (A–Z)</option>
              <option value="title,desc">Título (Z–A)</option>
              <option value="dueDate,asc">Vencimento (asc)</option>
              <option value="dueDate,desc">Vencimento (desc)</option>
            </select>
          </label>
        </div>

        <div className={`mt-3 flex flex-wrap items-center gap-3 ${busy ? "pointer-events-none opacity-70" : ""}`}>
          <label className="flex min-w-[280px] flex-1 items-center gap-2">
            <span className="whitespace-nowrap text-sm opacity-85">Buscar</span>
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
              placeholder="Título ou descrição..."
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/50"
            />
          </label>

          <button
            type="button"
            onClick={applySearch}
            disabled={busy}
            className={`rounded-xl border border-white/15 px-3 py-2 text-sm ${
              busy ? "cursor-not-allowed opacity-50" : "bg-white/10 hover:bg-white/15"
            }`}
          >
            Buscar
          </button>

          <label className="flex items-center gap-2">
            <span className="text-sm opacity-85">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as TaskStatus | "");
                setPage(0);
              }}
              className="rounded-xl border border-white/15 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
            >
              <option value="">Todos</option>
              <option value="TODO">TODO</option>
              <option value="DOING">DOING</option>
              <option value="DONE">DONE</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="text-sm opacity-85">Prioridade</span>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value as TaskPriority | "");
                setPage(0);
              }}
              className="rounded-xl border border-white/15 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
            >
              <option value="">Todas</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </label>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilters || busy}
            className={`rounded-xl border border-white/15 px-3 py-2 text-sm ${
              !hasFilters || busy ? "cursor-not-allowed opacity-50" : "bg-white/10 hover:bg-white/15"
            }`}
          >
            Limpar filtros
          </button>
        </div>
      </header>

      {error && <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm">{error}</div>}

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_14px_45px_rgba(0,0,0,0.18)] backdrop-blur">
        <TaskForm
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          editingTask={editingTask}
          onCancelEdit={handleCancelEdit}
          setError={setError}
          busy={busy}
        />
      </section>

      <section className="mt-4">
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
          busy={busy}
        />
      </section>
    </div>
  );
}





















