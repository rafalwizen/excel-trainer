import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { taskProgress } from "@/db/schema";

export type LessonProgress = {
  lessonSlug: string;
  completedCount: number;
  attemptsSum: number;
};

/**
 * Aggregated progress for every lesson the user has touched.
 * One GROUP BY query; counts come back as strings (bigint), so cast here.
 */
export async function getLessonProgress(
  userId: string,
): Promise<Map<string, LessonProgress>> {
  const rows = await db
    .select({
      lessonSlug: taskProgress.lessonSlug,
      completedCount: sql<number>`count(*) filter (where ${taskProgress.status} = 'completed')`,
      attemptsSum: sql<number>`coalesce(sum(${taskProgress.attempts}), 0)`,
    })
    .from(taskProgress)
    .where(eq(taskProgress.userId, userId))
    .groupBy(taskProgress.lessonSlug);

  return new Map(
    rows.map((row) => [
      row.lessonSlug,
      {
        lessonSlug: row.lessonSlug,
        completedCount: Number(row.completedCount),
        attemptsSum: Number(row.attemptsSum),
      },
    ]),
  );
}

/** Indexes of tasks of one lesson already completed by the user. */
export async function getCompletedTaskIndexes(
  userId: string,
  slug: string,
): Promise<number[]> {
  const rows = await db
    .select({ taskIndex: taskProgress.taskIndex })
    .from(taskProgress)
    .where(
      and(
        eq(taskProgress.userId, userId),
        eq(taskProgress.lessonSlug, slug),
        eq(taskProgress.status, "completed"),
      ),
    );

  return rows.map((row) => row.taskIndex);
}
