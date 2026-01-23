import { useMemo, useState, type ChangeEvent } from "react";
import type { Task, TaskPriority, TaskStatus } from "../api/taskApi";

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "DOING", "DONE"];
const PRIORITY_OPTIONS: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

type Props = {
  task: Task;
  onDelete: (id: number) => Promise<void> | void;
  onEdit: (task: Task) => void;
  onPatchStatus: (id: number, newStatus: TaskStatus) => Promise<void> | void;
  onPatchPriority: (id: number, newPriority: TaskPriority) => Promise<void> | void;
  busy?: boolean;
};

function formatDateBR(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

export default function TaskItem({
  task,
  onDelete,
  onEdit,
  onPatchStatus,
  onPatchPriority,
  busy = false,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPatchingStatus, setIsPatchingStatus] = useState(false);
  const [isPatchingPriority, setIsPatchingPriority] = useState(false);

  const isBusy = busy || isDeleting || isPatchingStatus || isPatchingPriority;

  const statusLabel: TaskStatus = task.status;
  const priorityLabel: TaskPriority = task.priority;
  const due = task.dueDate ? formatDateBR(task.dueDate) : null;

  const statusTone = useMemo(() => {
    if (statusLabel === "DONE") return { bg: "bg-emerald-400/15", bd: "border-emerald-400/40", text: "text-emerald-100" };
    if (statusLabel === "DOING") return { bg: "bg-sky-400/15", bd: "border-sky-400/40", text: "text-sky-100" };
    return { bg: "bg-white/10", bd: "border-white/15", text: "text-zinc-100" };
  }, [statusLabel]);

  const priorityTone = useMemo(() => {
    if (priorityLabel === "HIGH") return { bg: "bg-red-500/15", bd: "border-red-500/40", text: "text-red-100" };
    if (priorityLabel === "MEDIUM") return { bg: "bg-amber-400/15", bd: "border-amber-400/40", text: "text-amber-100" };
    return { bg: "bg-white/10", bd: "border-white/15", text: "text-zinc-100" };
  }, [priorityLabel]);

  async function handleDelete() {
    if (isBusy) return;

    const ok = window.confirm(`Excluir a tarefa #${task.id}?`);
    if (!ok) return;

    try {
      setIsDeleting(true);
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEdit() {
    if (isBusy) return;
    onEdit(task);
  }

  async function handleStatusChange(e: ChangeEvent<HTMLSelectElement>) {
    if (isBusy) return;
    const newStatus = e.target.value as TaskStatus;

    try {
      setIsPatchingStatus(true);
      await onPatchStatus(task.id, newStatus);
    } finally {
      setIsPatchingStatus(false);
    }
  }

  async function handlePriorityChange(e: ChangeEvent<HTMLSelectElement>) {
    if (isBusy) return;
    const newPriority = e.target.value as TaskPriority;

    try {
      setIsPatchingPriority(true);
      await onPatchPriority(task.id, newPriority);
    } finally {
      setIsPatchingPriority(false);
    }
  }

  return (
    <li
      className={`flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur ${
        isBusy ? "opacity-85" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <div className="truncate text-base font-extrabold tracking-tight">{task.title}</div>

          {due ? (
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
              Vence: {due}
            </span>
          ) : null}
        </div>

        {task.description ? (
          <div className="mt-2 text-sm leading-snug opacity-90">{task.description}</div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusTone.bg} ${statusTone.bd} ${statusTone.text}`}>
            Status: <b className="font-semibold">{statusLabel}</b>
          </span>

          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${priorityTone.bg} ${priorityTone.bd} ${priorityTone.text}`}>
            Prioridade: <b className="font-semibold">{priorityLabel}</b>
          </span>

          <label className="flex items-center gap-2">
            <span className="text-sm opacity-85">Alterar status</span>
            <select
              value={statusLabel}
              onChange={handleStatusChange}
              disabled={isBusy}
              className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="text-zinc-900">
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="text-sm opacity-85">Alterar prioridade</span>
            <select
              value={priorityLabel}
              onChange={handlePriorityChange}
              disabled={isBusy}
              className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p} className="text-zinc-900">
                  {p}
                </option>
              ))}
            </select>
          </label>

          {isPatchingStatus || isPatchingPriority ? (
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
              Salvando...
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <button
          onClick={handleEdit}
          disabled={isBusy}
          className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Editar
        </button>

        <button
          onClick={handleDelete}
          disabled={isBusy}
          className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </li>
  );
}











