import Link from "next/link";
import { difficultyLabel } from "@/content/difficulty";
import type { PrerequisiteRef } from "@/content/registry";
import type { Lesson } from "@/content/schema";

/**
 * "Czego się nauczysz" panel shown at the top of the runner sidebar:
 * learning goals, level/time/category meta and prerequisite links. Collapsible
 * so it steps aside once the learner starts working.
 */
export function LessonIntro({
  lesson,
  prerequisites,
}: {
  lesson: Lesson;
  prerequisites: PrerequisiteRef[];
}) {
  return (
    <details open className="group rounded-xl border border-neutral-200 bg-white">
      <summary className="flex cursor-pointer select-none items-center gap-2 px-4 py-3 text-sm font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="text-xs text-neutral-400 transition-transform group-open:rotate-90"
        >
          ▶
        </span>
        Czego się nauczysz
      </summary>
      <div className="space-y-3 border-t border-neutral-100 px-4 py-3">
        <ul className="space-y-1.5">
          {lesson.learningGoals.map((goal) => (
            <li
              key={goal}
              className="flex items-start gap-2 text-sm leading-5 text-neutral-700"
            >
              <span aria-hidden="true" className="mt-0.5 text-green-700">
                ✓
              </span>
              {goal}
            </li>
          ))}
        </ul>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
          <span className="font-medium text-neutral-600">
            Poziom: {difficultyLabel(lesson.difficulty)}
          </span>
          <span aria-hidden="true">·</span>
          <span>~{lesson.estimatedMinutes} min</span>
          <span aria-hidden="true">·</span>
          <span>{lesson.category}</span>
        </p>
        {prerequisites.length > 0 ? (
          <p className="text-xs leading-5 text-neutral-500">
            Warto najpierw zrobić:{" "}
            {prerequisites.map((prerequisite, index) => (
              <span key={prerequisite.slug}>
                {index > 0 ? ", " : ""}
                <Link
                  href={`/lekcje/${prerequisite.slug}`}
                  className="font-medium text-green-700 hover:underline"
                >
                  {prerequisite.title}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </details>
  );
}
