import { difficultyLabel } from "@/content/difficulty";
import type { Lesson } from "@/content/schema";

/**
 * Server-rendered lesson description below the runner: stable prose for
 * crawlers (the interactive runner carries the tasks, this section carries
 * the copy). Mirrors what the learner sees in the intro panel.
 */
export function LessonSeoSection({ lesson }: { lesson: Lesson }) {
  const description = lesson.seoDescription ?? lesson.shortDescription;
  return (
    <section
      aria-labelledby="lesson-about"
      className="border-t border-neutral-200 bg-white"
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-8 sm:px-6">
        <h2 id="lesson-about" className="text-base font-semibold text-neutral-900">
          O lekcji „{lesson.title}”
        </h2>
        <p className="text-sm leading-6 text-neutral-700">{description}</p>
        <h3 className="text-sm font-semibold text-neutral-900">
          Czego się nauczysz
        </h3>
        <ul className="list-inside list-disc space-y-1 text-sm leading-6 text-neutral-700">
          {lesson.learningGoals.map((goal) => (
            <li key={goal}>{goal}</li>
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
          <span aria-hidden="true">·</span>
          <span>
            {lesson.tasks.length}{" "}
            {lesson.tasks.length === 1 ? "zadanie" : "zadań"}
          </span>
        </p>
      </div>
    </section>
  );
}
