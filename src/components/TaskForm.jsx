import { useEffect, useState } from "react";

const STATUS_OPTIONS = ["TODO", "DOING", "DONE"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

export default function TaskForm({ onCreate, onUpdate, editingTask, onCancelEdit, setError }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("LOW");
  const [dueDate, setDueDate] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!editingTask;

  useEffect(() => {
    if (!editingTask) return;

    setTitle(editingTask.title ?? "");
    setDescription(editingTask.description ?? "");
    setStatus(editingTask.status ?? "TODO");
    setPriority(editingTask.priority ?? "LOW");
    setDueDate(editingTask.dueDate ?? "");
  }, [editingTask]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("TODO");
    setPriority("LOW");
    setDueDate("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError?.("Título é obrigatório.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      dueDate: dueDate || null,
    };

    try {
      setError?.("");
      setSubmitting(true);

      if (isEditMode) {
        await onUpdate(editingTask.id, payload);
      } else {
        await onCreate(payload);
        resetForm();
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setError?.("");
    onCancelEdit?.();
    resetForm();
  }

  return (
    <>
      <h2>{isEditMode ? `Editando tarefa #${editingTask.id}` : "Nova tarefa"}</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 10, borderRadius: 6 }}
          disabled={submitting}
        />

        <textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ padding: 10, borderRadius: 6 }}
          disabled={submitting}
        />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label>
            Status:{" "}
            <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={submitting}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label>
            Prioridade:{" "}
            <select value={priority} onChange={(e) => setPriority(e.target.value)} disabled={submitting}>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label>
            Vencimento:{" "}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={submitting}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: 12, borderRadius: 8, fontWeight: 700 }}
          >
            {submitting ? (isEditMode ? "Salvando..." : "Criando...") : isEditMode ? "Salvar alterações" : "Criar tarefa"}
          </button>

          {isEditMode ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              style={{ padding: 12, borderRadius: 8 }}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}


