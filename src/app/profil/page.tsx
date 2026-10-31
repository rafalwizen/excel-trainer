import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { allLessons } from "@/content/registry";
import { SignOutButton } from "@/features/auth/SignOutButton";
import { getLessonProgress } from "@/features/progress/queries";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Mój profil — Excel Trainer",
};

export default function ProfilePage() {
  // Session + DB reads live inside Suspense (cacheComponents requirement).
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm text-neutral-500">
          Wczytywanie profilu…
        </div>
      }
    >
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  const user = await getCurrentUser(); // redirects to /logowanie when anonymous
  const progress = await getLessonProgress(user.id);

  // Registry drives the totals; the DB only stores what the user touched.
  const totalTasks = allLessons.reduce((sum, l) => sum + l.tasks.length, 0);
  const completedTasks = allLessons.reduce(
    (sum, l) => sum + (progress.get(l.slug)?.completedCount ?? 0),
    0,
  );
  const completedLessons = allLessons.filter(
    (l) => (progress.get(l.slug)?.completedCount ?? 0) >= l.tasks.length,
  ).length;
  const attempts = [...progress.values()].reduce(
    (sum, row) => sum + row.attemptsSum,
    0,
  );
  const startedLessons = allLessons.filter((l) => progress.has(l.slug));

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/lekcje"
            className="rounded-lg px-2 py-1 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Wróć do listy lekcji"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold text-neutral-900">
            Mój profil
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-neutral-500 sm:inline">
              {user.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        <section>
          <p className="text-sm text-neutral-500">Zalogowany jako</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">
            {user.name}
          </p>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Ukończone lekcje"
            value={`${completedLessons}/${allLessons.length}`}
          />
          <StatCard
            label="Zaliczone zadania"
            value={`${completedTasks}/${totalTasks}`}
          />
          <StatCard label="Łączna liczba prób" value={String(attempts)} />
        </section>

        <section aria-labelledby="progress-heading">
          <h2
            id="progress-heading"
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400"
          >
            Postęp według lekcji
          </h2>
          {startedLessons.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-6 text-center text-sm text-neutral-500">
              Nie rozpocząłeś jeszcze żadnej lekcji.{" "}
              <Link
                href="/lekcje"
                className="font-medium text-neutral-900 underline"
              >
                Wybierz pierwszą
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {startedLessons.map((lesson) => {
                const row = progress.get(lesson.slug);
                const completed = row?.completedCount ?? 0;
                const total = lesson.tasks.length;
                return (
                  <li
                    key={lesson.slug}
                    className="rounded-xl border border-neutral-200 bg-white p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <Link
                        href={`/lekcje/${lesson.slug}`}
                        className="font-medium text-neutral-900 hover:underline"
                      >
                        {lesson.title}
                      </Link>
                      <span className="shrink-0 text-neutral-500">
                        {completed}/{total} zadań · {row?.attemptsSum ?? 0} prób
                      </span>
                    </div>
                    <ProgressBar completed={completed} total={total} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
