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
  return {
    title: lesson ? `${lesson.title} — Excel Trainer` : "Lekcja — Excel Trainer",
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

  return <LessonRunner lesson={lesson} initialCompleted={initialCompleted} />;
}
