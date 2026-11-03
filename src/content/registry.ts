import { CATEGORIES } from "./categories";
import { lessonInvariants } from "./invariants";
import { rawLessons } from "./lessons";
import { lessonSchema, type Lesson } from "./schema";

function load(): Lesson[] {
  const lessons = rawLessons.map((lesson) => lessonSchema.parse(lesson));

  // Registry-level invariants: duplicate slugs, per-lesson bound problems
  // and dangling prerequisites are build-time errors (this module is
  // imported by pages).
  const slugs = new Set<string>();
  for (const lesson of lessons) {
    if (slugs.has(lesson.slug)) {
      throw new Error(`Duplikat slugu lekcji: ${lesson.slug}`);
    }
    slugs.add(lesson.slug);
    const problems = lessonInvariants(lesson);
    if (problems.length > 0) {
      throw new Error(
        `Lekcja ${lesson.slug} ma niespójną treść:\n${problems.join("\n")}`,
      );
    }
  }
  for (const lesson of lessons) {
    for (const prerequisite of lesson.prerequisites) {
      if (!slugs.has(prerequisite)) {
        throw new Error(
          `Lekcja ${lesson.slug} wymaga nieistniejącej lekcji: ${prerequisite}`,
        );
      }
    }
  }
  return lessons;
}

export const allLessons: Lesson[] = load();

/** Categories in curated catalog order (see categories.ts), used ones only. */
export const categories: string[] = CATEGORIES.filter((category) =>
  allLessons.some((lesson) => lesson.category === category),
);

export function getLesson(slug: string): Lesson | undefined {
  return allLessons.find((lesson) => lesson.slug === slug);
}

export function totalTasks(lesson: Lesson): number {
  return lesson.tasks.length;
}

/** Prerequisite with its title resolved — ready for links in the UI. */
export interface PrerequisiteRef {
  slug: string;
  title: string;
}

/**
 * Catalog-facing projection of a lesson: metadata only, no tasks, no
 * workbook data. Client components (lesson browser) receive this instead of
 * full lessons so instructions and cell matrices never cross the RSC
 * boundary on catalog pages.
 */
export interface LessonSummary {
  slug: string;
  title: string;
  shortDescription: string;
  category: Lesson["category"];
  difficulty: Lesson["difficulty"];
  estimatedMinutes: number;
  learningGoals: string[];
  taskCount: number;
  prerequisites: PrerequisiteRef[];
}

export const lessonSummaries: LessonSummary[] = allLessons.map((lesson) => ({
  slug: lesson.slug,
  title: lesson.title,
  shortDescription: lesson.shortDescription,
  category: lesson.category,
  difficulty: lesson.difficulty,
  estimatedMinutes: lesson.estimatedMinutes,
  learningGoals: lesson.learningGoals,
  taskCount: lesson.tasks.length,
  prerequisites: lesson.prerequisites.map((slug) => ({
    slug,
    title: getLesson(slug)?.title ?? slug,
  })),
}));
