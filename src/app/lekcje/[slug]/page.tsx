import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { allLessons, getLesson } from "@/content/registry";
import { LessonRunner } from "@/features/lessons/LessonRunner";
import { getCompletedTaskIndexes } from "@/features/progress/queries";
import { getCurrentUser } from "@/lib/session";

export function generateStaticParams() {
  return allLessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lekcja — Excel Trainer" };
  return {
    title: `${lesson.title} — Excel Trainer`,
    description: `${lesson.shortDescription} Nauczysz się: ${lesson.learningGoals.slice(0, 3).join("; ")}.`,
  };
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // With cacheComponents, `params` must be read inside a Suspense boundary.
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm text-neutral-500">
          Wczytywanie lekcji…
        </div>
      }
    >
      <LessonContent params={params} />
    </Suspense>
  );
}

async function LessonContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  // Progress restore requires a session; anonymous users are sent to /logowanie.
  const user = await getCurrentUser();
  const initialCompleted = await getCompletedTaskIndexes(user.id, slug);

  // Resolve prerequisite titles server-side so the runner stays client-light.
  const prerequisites = lesson.prerequisites.map((prereqSlug) => ({
    slug: prereqSlug,
    title: getLesson(prereqSlug)?.title ?? prereqSlug,
  }));

  return (
    <LessonRunner
      lesson={lesson}
      prerequisites={prerequisites}
      initialCompleted={initialCompleted}
    />
  );
}
