import { lessonInvariants } from "./invariants";
import { rawLessons } from "./lessons";
import { lessonSchema, type Lesson } from "./schema";

function load(): Lesson[] {
  const lessons = rawLessons.map((lesson) => lessonSchema.parse(lesson));

  // Registry-level invariants: duplicate slugs and per-lesson bound problems
  // are build-time errors (this module is imported by pages).
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
  return lessons;
}

export const allLessons: Lesson[] = load();

export const categories: string[] = [
  ...new Set(allLessons.map((lesson) => lesson.category)),
];

export function getLesson(slug: string): Lesson | undefined {
  return allLessons.find((lesson) => lesson.slug === slug);
}

export function totalTasks(lesson: Lesson): number {
  return lesson.tasks.length;
}
