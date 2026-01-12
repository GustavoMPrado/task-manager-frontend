// src/components/TaskItem.jsx
import { useState } from "react";

const STATUS_OPTIONS = ["TODO", "DOING", "DONE"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

export default function TaskItem({ task, onDelete, onEdit, onPatchStatus, onPatchPriority }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPatchingStatus, setIsPatchingStatus] = useState(false);
  const [isPatchingPriority, setIsPatchingPriority] = useState(false);

  async function handleDelete() {
    if (isDeleting) return;

    const ok = confirm(`Excluir a tarefa #${task.id}?`);
    if (!ok) return;

    try {
      setIsDeleting(true);
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEdit() {
    onEdit?.(task);
  }

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    if (!onPatchStatus) return;

    try {
      setIsPatchingStatus(true);
      await onPatchStatus(task.id, newStatus);
    } finally {
      setIsPatchingStatus(false);
    }
  }

  async function handlePriorityChange(e) {
    const newPriority = e.target.value;
    if (!onPatchPriority) return;

    try {
      setIsPatchingPriority(true);
      await onPatchPriority(task.id, newPriority);
    } finally {
      setIsPatchingPriority(false);
    }
  }

  const isBusy = isDeleting || isPatchingStatus || isPatchingPriority;

  return (
    <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div>
          <b>{task.title}</b>
          {task.dueDate ? ` — vence: ${task.dueDate}` : ""}
        </div>

        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Status</span>
            <select value={task.status} onChange={handleStatusChange} disabled={isBusy}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Prioridade</span>
            <select value={task.priority} onChange={handlePriorityChange} disabled={isBusy}>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          {isPatchingStatus || isPatchingPriority ? <span>Salvando...</span> : null}
        </div>
      </div>

      <button onClick={handleEdit} disabled={isBusy} style={{ padding: "6px 10px" }}>
        Editar
      </button>

      <button onClick={handleDelete} disabled={isBusy} style={{ padding: "6px 10px" }}>
        {isDeleting ? "Excluindo..." : "Excluir"}
      </button>
    </li>
  );
}






