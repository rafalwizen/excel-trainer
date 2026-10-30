import type { Lesson } from "@/content/schema";

export function TaskSidebar({
  lesson,
  taskIndex,
  completed,
  onSelect,
}: {
  lesson: Lesson;
  taskIndex: number;
  completed: Set<number>;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Lista zadań" className="space-y-1.5">
      {lesson.tasks.map((task, index) => {
        const isDone = completed.has(index);
        const isCurrent = index === taskIndex;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
              isCurrent
                ? "bg-green-700/10 font-medium text-green-900 ring-1 ring-green-700/30"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                isDone
                  ? "bg-green-700 text-white"
                  : "bg-neutral-200 text-neutral-600"
              }`}
              aria-hidden
            >
              {isDone ? "✓" : index + 1}
            </span>
            <span className="truncate">{task.title}</span>
          </button>
        );
      })}
    </nav>
  );
}
