"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Lesson } from "@/content/schema";
import { recordTaskResult } from "@/features/progress/actions";
import { runChecks } from "@/lib/validators/run";
import type { CheckResults } from "@/lib/validators/types";
import type { GetSnapshot } from "./UniverEditor";
import { CheckResultsPanel } from "./CheckResults";
import { Instructions } from "./Instructions";
import { TaskSidebar } from "./TaskSidebar";

// Univer is client-only and heavy — never render it on the server.
const UniverEditor = dynamic(() => import("./UniverEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-neutral-50 text-sm text-neutral-500">
      Wczytywanie arkusza…
    </div>
  ),
});

function firstIncomplete(lesson: Lesson, completed: Set<number>): number {
  const index = lesson.tasks.findIndex((_, i) => !completed.has(i));
  return index === -1 ? 0 : index;
}

export function LessonRunner({
  lesson,
  initialCompleted,
}: {
  lesson: Lesson;
  /** Indexes of tasks already completed by this user (restored from DB). */
  initialCompleted: number[];
}) {
  const [completed, setCompleted] = useState<Set<number>>(
    () => new Set(initialCompleted),
  );
  const [taskIndex, setTaskIndex] = useState(() =>
    firstIncomplete(lesson, new Set(initialCompleted)),
  );
  const [results, setResults] = useState<CheckResults | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [getSnapshot, setGetSnapshot] = useState<GetSnapshot | null>(null);

  const task = lesson.tasks[taskIndex];
  const taskPassed = results?.passed === true;
  const allDone = completed.size === lesson.tasks.length;
  const nextIndex = useMemo(
    () => lesson.tasks.findIndex((_, i) => !completed.has(i)),
    [lesson.tasks, completed],
  );

  function goToTask(index: number) {
    setTaskIndex(index);
    setResults(null);
    setHintsShown(0);
    // The editor remounts (key change); its getSnapshot is stale until ready.
    setGetSnapshot(null);
  }

  async function handleCheck() {
    if (!getSnapshot || checking) return;
    setChecking(true);
    try {
      const snapshot = await getSnapshot();
      const checkResults = runChecks(task.checks, snapshot);
      setResults(checkResults);
      if (checkResults.passed) {
        setCompleted((prev) => new Set(prev).add(taskIndex));
      }
      // Persist the attempt in the background — the UI never waits on it.
      recordTaskResult(lesson.slug, taskIndex, checkResults.passed).catch(
        (error) => console.error("Failed to record task result", error),
      );
    } finally {
      setChecking(false);
    }
  }

  const progressLabel = `${completed.size}/${lesson.tasks.length}`;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/lekcje"
            className="rounded-lg px-2 py-1 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Wróć do listy lekcji"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-neutral-900 sm:text-lg">
              {lesson.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-600">
              {lesson.category}
            </span>
            <span className="text-amber-500" title={`Poziom ${lesson.difficulty}`}>
              {"★".repeat(lesson.difficulty)}
              <span className="text-neutral-300">
                {"★".repeat(3 - lesson.difficulty)}
              </span>
            </span>
            <span className="rounded-full bg-green-700/10 px-2.5 py-1 font-semibold text-green-800">
              {progressLabel}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="w-full shrink-0 space-y-5 border-b border-neutral-200 bg-white p-5 lg:w-[380px] lg:border-r lg:border-b-0 lg:overflow-y-auto">
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Zadania
            </h2>
            <TaskSidebar
              lesson={lesson}
              taskIndex={taskIndex}
              completed={completed}
              onSelect={goToTask}
            />
          </section>

          <section className="rounded-xl border border-neutral-200 p-4">
            <h2 className="mb-2 text-sm font-semibold text-neutral-900">
              {task.title}
            </h2>
            <Instructions text={task.instructions} />
          </section>

          {task.hints.length > 0 ? (
            <section className="space-y-2">
              {task.hints.slice(0, hintsShown).map((hint, i) => (
                <p
                  key={i}
                  className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200"
                >
                  💡 {hint}
                </p>
              ))}
              {hintsShown < task.hints.length ? (
                <button
                  type="button"
                  onClick={() => setHintsShown((n) => n + 1)}
                  className="text-sm font-medium text-amber-700 hover:underline"
                >
                  Pokaż podpowiedź ({hintsShown}/{task.hints.length})
                </button>
              ) : null}
            </section>
          ) : null}

          {results ? <CheckResultsPanel results={results} /> : null}

          {allDone ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <p className="font-semibold">Lekcja ukończona! 🎉</p>
              <p className="mt-1">
                Świetnie — wszystkie zadania są zaliczone.
              </p>
              <Link
                href="/lekcje"
                className="mt-2 inline-block font-medium text-green-800 underline"
              >
                Wybierz następną lekcję
              </Link>
            </div>
          ) : taskPassed && nextIndex !== -1 ? (
            <button
              type="button"
              onClick={() => goToTask(nextIndex)}
              className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
            >
              Następne zadanie →
            </button>
          ) : null}
        </aside>

        <main className="min-h-[480px] flex-1 lg:min-h-0">
          <UniverEditor
            key={taskIndex}
            workbook={task.initialWorkbook}
            // Wrap explicitly: passing setGetSnapshot bare would make React
            // treat the callback as a state updater and store its result.
            onReady={(getSnapshot) => setGetSnapshot(() => getSnapshot)}
          />
        </main>
      </div>

      <footer className="border-t border-neutral-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            Zadanie {taskIndex + 1} z {lesson.tasks.length}
            {getSnapshot ? "" : " — arkusz się ładuje…"}
          </p>
          <button
            type="button"
            onClick={handleCheck}
            disabled={!getSnapshot || checking}
            className="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking ? "Sprawdzanie…" : "Sprawdź"}
          </button>
        </div>
      </footer>
    </div>
  );
}
