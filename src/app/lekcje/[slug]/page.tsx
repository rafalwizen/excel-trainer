import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { difficultyLabel } from "@/content/difficulty";
import { allLessons, getLesson } from "@/content/registry";
import { LessonRunner } from "@/features/lessons/LessonRunner";
import { LessonSeoSection } from "@/features/lessons/LessonSeoSection";
import { getCompletedTaskIndexes } from "@/features/progress/queries";
import { getSessionUser } from "@/lib/session";

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
  if (!lesson) return { title: "Lekcja" };
  const description =
    lesson.seoDescription ??
    `${lesson.shortDescription} Nauczysz się: ${lesson.learningGoals.slice(0, 3).join("; ")}.`;
  return {
    title: lesson.title,
    description,
    alternates: { canonical: `/lekcje/${slug}` },
    keywords: [lesson.category, ...lesson.learningGoals.slice(0, 3)],
    openGraph: {
      type: "article",
      url: `/lekcje/${slug}`,
      title: lesson.title,
      description,
    },
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

  // Lesson pages are public (SEO); only auth-gated lessons redirect.
  // Progress restore is skipped for anonymous visitors (empty list).
  const user = await getSessionUser();
  if (lesson.requiresAuth && !user) redirect("/logowanie");
  const initialCompleted = await getCompletedTaskIndexes(user?.id ?? null, slug);

  // Resolve prerequisite titles server-side so the runner stays client-light.
  const prerequisites = lesson.prerequisites.map((prereqSlug) => ({
    slug: prereqSlug,
    title: getLesson(prereqSlug)?.title ?? prereqSlug,
  }));

  const base = process.env.BASE_URL ?? "http://localhost:3000";
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: lesson.title,
    description: lesson.seoDescription ?? lesson.shortDescription,
    url: `${base}/lekcje/${slug}`,
    inLanguage: "pl",
    educationalLevel: difficultyLabel(lesson.difficulty),
    provider: {
      "@type": "Organization",
      name: "Ćwicz Excel",
      url: base,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: base },
      { "@type": "ListItem", position: 2, name: "Lekcje", item: `${base}/lekcje` },
      {
        "@type": "ListItem",
        position: 3,
        name: lesson.title,
        item: `${base}/lekcje/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <LessonRunner
        lesson={lesson}
        prerequisites={prerequisites}
        initialCompleted={initialCompleted}
      />
      <LessonSeoSection lesson={lesson} />
    </>
  );
}
