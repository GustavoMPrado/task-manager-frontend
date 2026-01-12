// src/components/TaskList.jsx
import TaskItem from "./TaskItem";
import Pagination from "./Pagination";

export default function TaskList({
  tasks,
  loadingList,
  onDelete,
  onEdit,
  onPatchStatus,
  onPatchPriority,
  page,
  totalPages,
  onPrev,
  onNext,
}) {
  return (
    <>
      <h2>Tarefas</h2>

      {loadingList ? (
        <p>Carregando...</p>
      ) : tasks.length === 0 ? (
        <p>Nenhuma tarefa ainda.</p>
      ) : (
        <>
          <ul style={{ display: "grid", gap: 10, paddingLeft: 18 }}>
            {tasks.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                onDelete={onDelete}
                onEdit={onEdit}
                onPatchStatus={onPatchStatus}
                onPatchPriority={onPatchPriority}
              />
            ))}
          </ul>

          <div style={{ marginTop: 16 }}>
            <Pagination page={page} totalPages={totalPages} onPrev={onPrev} onNext={onNext} />
          </div>
        </>
      )}
    </>
  );
}




