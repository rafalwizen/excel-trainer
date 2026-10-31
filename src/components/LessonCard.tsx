import Link from "next/link";
import type { Lesson } from "@/content/schema";
import { ProgressBar } from "./ProgressBar";

export function LessonCard({
  lesson,
  completedCount,
}: {
  lesson: Lesson;
  completedCount: number;
}) {
  const total = lesson.tasks.length;
  const done = completedCount >= total;

  return (
    <Link
      href={`/lekcje/${lesson.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-neutral-900 group-hover:underline">
          {lesson.title}
        </h3>
        {done ? (
          <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            Ukończona
          </span>
        ) : null}
      </div>

      <p className="text-sm leading-relaxed text-neutral-600">
        {lesson.shortDescription}
      </p>

      <div className="mt-auto space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-2">
            <span className="text-amber-500">
              {"★".repeat(lesson.difficulty)}
              <span className="text-neutral-300">
                {"★".repeat(3 - lesson.difficulty)}
              </span>
            </span>
            <span>{total} zadań</span>
          </span>
          <span className="font-medium text-neutral-600">
            {completedCount}/{total}
          </span>
        </div>
        <ProgressBar completed={completedCount} total={total} />
      </div>
    </Link>
  );
}
