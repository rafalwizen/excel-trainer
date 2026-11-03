"use client";

import { useState } from "react";
import { CATEGORIES } from "@/content/categories";
import { difficultyLabel } from "@/content/difficulty";
import type { LessonSummary } from "@/content/registry";
import { LessonCard } from "./LessonCard";

type LevelFilter = 0 | 1 | 2 | 3;

const LEVEL_TAB_STYLE = {
  idle: "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400",
  active: "border-neutral-900 bg-neutral-900 text-white",
};

const CHIP_STYLE = {
  idle: "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400",
  active: "border-green-700 bg-green-700/10 text-green-800",
};

/**
 * Catalog browser: level tabs + category chips over the lesson summaries.
 * Pure client-side filtering (no routing) — the whole catalog is small
 * enough to render at once.
 */
export function LessonBrowser({
  summaries,
  progress,
}: {
  summaries: LessonSummary[];
  progress: Record<string, number>;
}) {
  const [level, setLevel] = useState<LevelFilter>(0);
  const [category, setCategory] = useState<string | null>(null);

  const visible = summaries.filter(
    (summary) =>
      (level === 0 || summary.difficulty === level) &&
      (category === null || summary.category === category),
  );

  const usedCategories = CATEGORIES.filter((c) =>
    summaries.some((summary) => summary.category === c),
  );

  const levelTabs: { value: LevelFilter; label: string }[] = [
    { value: 0, label: "Wszystkie" },
    { value: 1, label: difficultyLabel(1) },
    { value: 2, label: difficultyLabel(2) },
    { value: 3, label: difficultyLabel(3) },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtruj według poziomu"
        >
          {levelTabs.map((tab) => {
            const active = level === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={active}
                onClick={() => setLevel(tab.value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  active ? LEVEL_TAB_STYLE.active : LEVEL_TAB_STYLE.idle
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtruj według kategorii"
        >
          <button
            type="button"
            aria-pressed={category === null}
            onClick={() => setCategory(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              category === null ? CHIP_STYLE.active : CHIP_STYLE.idle
            }`}
          >
            Wszystkie kategorie
          </button>
          {usedCategories.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(active ? null : c)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active ? CHIP_STYLE.active : CHIP_STYLE.idle
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-neutral-500" aria-live="polite">
        {visible.length} z {summaries.length} lekcji
      </p>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
          Brak lekcji dla wybranych filtrów — wyczyść poziom lub kategorię.
        </div>
      ) : (
        usedCategories
          .map((c) => ({ category: c, lessons: visible.filter((s) => s.category === c) }))
          .filter(({ lessons }) => lessons.length > 0)
          .map(({ category: c, lessons }) => (
            <section key={c} aria-labelledby={`cat-${c}`}>
              <h2
                id={`cat-${c}`}
                className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400"
              >
                {c}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {lessons.map((summary) => (
                  <LessonCard
                    key={summary.slug}
                    summary={summary}
                    completedCount={progress[summary.slug] ?? 0}
                  />
                ))}
              </div>
            </section>
          ))
      )}
    </div>
  );
}
