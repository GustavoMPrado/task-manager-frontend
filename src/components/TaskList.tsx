import type { Task, TaskPriority, TaskStatus } from "../api/taskApi";
import TaskItem from "./TaskItem";
import Pagination from "./Pagination";

type Props = {
  tasks: Task[];
  loadingList: boolean;
  onDelete: (id: number) => Promise<void> | void;
  onEdit: (task: Task) => void;
  onPatchStatus: (id: number, newStatus: TaskStatus) => Promise<void> | void;
  onPatchPriority: (id: number, newPriority: TaskPriority) => Promise<void> | void;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  busy?: boolean;
};

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
  busy = false,
}: Props) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur ${
        busy ? "pointer-events-none opacity-85" : ""
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-xl font-semibold tracking-tight">Tarefas</h2>
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">{tasks.length}</span>
      </div>

      <div className="mt-4">
        {loadingList ? (
          <div className="grid gap-3">
            <div className="h-[74px] rounded-xl border border-white/10 bg-white/10" />
            <div className="h-[74px] rounded-xl border border-white/10 bg-white/10" />
            <div className="h-[74px] rounded-xl border border-white/10 bg-white/10" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-sm">Nenhuma tarefa encontrada.</div>
        ) : (
          <>
            <ul className="m-0 grid list-none gap-3 p-0">
              {tasks.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onPatchStatus={onPatchStatus}
                  onPatchPriority={onPatchPriority}
                  busy={busy}
                />
              ))}
            </ul>

            <div className="mt-4 flex justify-center">
              <Pagination page={page} totalPages={totalPages} onPrev={onPrev} onNext={onNext} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}












