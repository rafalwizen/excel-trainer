import Link from "next/link";
import { difficultyLabel } from "@/content/difficulty";
import type { LessonSummary } from "@/content/registry";
import { plPlural } from "@/lib/plural";
import { ProgressBar } from "../ProgressBar";

const LEVEL_BADGE: Record<number, string> = {
  1: "bg-green-100 text-green-800",
  2: "bg-amber-100 text-amber-800",
  3: "bg-rose-100 text-rose-800",
};

export function LessonCard({
  summary,
  completedCount,
}: {
  summary: LessonSummary;
  completedCount: number;
}) {
  const total = summary.taskCount;
  const done = completedCount >= total;
  const goals = summary.learningGoals.slice(0, 2);

  return (
    <Link
      href={`/lekcje/${summary.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-neutral-900 group-hover:underline">
          {summary.title}
        </h3>
        {done ? (
          <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            Ukończona
          </span>
        ) : null}
      </div>

      <p className="text-sm leading-relaxed text-neutral-600">
        {summary.shortDescription}
      </p>

      {goals.length > 0 ? (
        <ul className="space-y-1">
          {goals.map((goal) => (
            <li
              key={goal}
              className="flex items-start gap-1.5 text-xs leading-5 text-neutral-500"
            >
              <span aria-hidden="true" className="text-green-700">
                ✓
              </span>
              {goal}
            </li>
          ))}
        </ul>
      ) : null}

      {summary.prerequisites.length > 0 ? (
        <p className="text-xs text-neutral-400">
          Wymaga: {summary.prerequisites.map((p) => p.title).join(", ")}
        </p>
      ) : null}

      <div className="mt-auto space-y-2 pt-1">
        <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${LEVEL_BADGE[summary.difficulty]}`}
            >
              {difficultyLabel(summary.difficulty)}
            </span>
            <span>~{summary.estimatedMinutes} min</span>
            <span>
              {total} {plPlural(total, "zadanie", "zadania", "zadań")}
            </span>
          </span>
          <span className="shrink-0 font-medium text-neutral-600">
            {completedCount}/{total}
          </span>
        </div>
        <ProgressBar completed={completedCount} total={total} />
      </div>
    </Link>
  );
}
