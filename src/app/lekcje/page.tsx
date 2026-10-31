import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LessonCard } from "@/components/LessonCard";
import { allLessons, categories } from "@/content/registry";
import { getLessonProgress } from "@/features/progress/queries";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Lekcje — Excel Trainer",
};

export default function LessonsPage() {
  // Session + DB reads live inside Suspense (cacheComponents requirement).
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Catalog />
    </Suspense>
  );
}

async function Catalog() {
  const user = await getCurrentUser(); // redirects to /logowanie when anonymous
  const progress = await getLessonProgress(user.id);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
          <h1 className="text-lg font-semibold text-neutral-900">Lekcje</h1>
          <span className="text-sm text-neutral-400">
            {allLessons.length} tematów do treningu
          </span>
          <Link
            href="/profil"
            className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            Mój profil
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        {categories.map((category) => (
          <section key={category} aria-labelledby={`cat-${category}`}>
            <h2
              id={`cat-${category}`}
              className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400"
            >
              {category}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {allLessons
                .filter((lesson) => lesson.category === category)
                .map((lesson) => (
                  <LessonCard
                    key={lesson.slug}
                    lesson={lesson}
                    completedCount={
                      progress.get(lesson.slug)?.completedCount ?? 0
                    }
                  />
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <div className="border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
        <div className="h-6 w-24 animate-pulse rounded bg-neutral-200" />
      </div>
      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6">
        {[0, 1].map((group) => (
          <div key={group} className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((card) => (
              <div
                key={card}
                className="h-36 animate-pulse rounded-2xl border border-neutral-200 bg-white"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
