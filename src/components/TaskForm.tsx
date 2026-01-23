import { useEffect, useMemo, useState } from "react";
import type { Task, TaskCreatePayload, TaskPriority, TaskStatus, TaskUpdatePayload } from "../api/taskApi";

type TaskFormProps = {
  onCreate: (payload: TaskCreatePayload) => Promise<void> | void;
  onUpdate: (id: number, payload: TaskUpdatePayload) => Promise<void> | void;
  editingTask: Task | null;
  onCancelEdit?: () => void;
  setError?: (msg: string) => void;
  busy?: boolean;
};

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "DOING", "DONE"];
const PRIORITY_OPTIONS: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

export default function TaskForm({
  onCreate,
  onUpdate,
  editingTask,
  onCancelEdit,
  setError,
  busy = false,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("LOW");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!editingTask;
  const disabled = submitting || busy;

  const inputClass = useMemo(
    () =>
      "w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/50 disabled:cursor-not-allowed disabled:opacity-60",
    []
  );

  const selectClass = useMemo(
    () =>
      "w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60",
    []
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("TODO");
    setPriority("LOW");
    setDueDate("");
  }

  useEffect(() => {
    if (!editingTask) {
      resetForm();
      return;
    }

    setTitle(editingTask.title ?? "");
    setDescription(editingTask.description ?? "");
    setStatus(editingTask.status ?? "TODO");
    setPriority(editingTask.priority ?? "LOW");
    setDueDate(editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : "");
  }, [editingTask]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;

    if (!title.trim()) {
      setError?.("Título é obrigatório.");
      return;
    }

    const payload: TaskCreatePayload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      dueDate: dueDate || null,
    };

    try {
      setError?.("");
      setSubmitting(true);

      if (isEditMode && editingTask) {
        const updatePayload: TaskUpdatePayload = payload;
        await onUpdate(editingTask.id, updatePayload);
      } else {
        await onCreate(payload);
        resetForm();
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (disabled) return;
    setError?.("");
    onCancelEdit?.();
    resetForm();
  }

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="m-0 text-xl font-semibold tracking-tight">
          {isEditMode && editingTask ? `Editando tarefa #${editingTask.id}` : "Nova tarefa"}
        </h2>

        {isEditMode ? (
          <span
            className={`rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs ${
              disabled ? "opacity-70" : ""
            }`}
          >
            Modo edição
          </span>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className={`mt-3 grid gap-3 ${disabled ? "opacity-90" : ""}`}>
        <div className="grid gap-2">
          <label className="text-xs font-medium opacity-90">Título</label>
          <input
            placeholder="Ex: Pagar contas"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            className={inputClass}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-medium opacity-90">Descrição</label>
          <textarea
            placeholder="Detalhes (opcional)"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={3}
            className={`${inputClass} resize-y`}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-xs font-medium opacity-90">Status</label>
            <select
              value={status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as TaskStatus)}
              disabled={disabled}
              className={selectClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="text-zinc-900">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium opacity-90">Prioridade</label>
            <select
              value={priority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as TaskPriority)}
              disabled={disabled}
              className={selectClass}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p} className="text-zinc-900">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium opacity-90">Vencimento</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
              disabled={disabled}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={disabled}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disabled ? (isEditMode ? "Salvando..." : "Criando...") : isEditMode ? "Salvar alterações" : "Criar tarefa"}
          </button>

          {isEditMode ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={disabled}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}







