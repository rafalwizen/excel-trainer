"use server";

import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getLesson } from "@/content/registry";
import { auth } from "@/features/auth/auth";
import { db } from "@/db";
import { taskProgress } from "@/db/schema";

/**
 * Persist one "Sprawdź" outcome. Idempotent and race-safe thanks to the
 * unique (user_id, lesson_slug, task_index) constraint; a failed retry
 * never downgrades an already completed task.
 */
export async function recordTaskResult(
  slug: string,
  taskIndex: number,
  passed: boolean,
): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  // Anonymous users get client-side validation only — nothing to persist.
  if (!session) return;

  const lesson = getLesson(slug);
  if (!lesson) return;
  if (
    !Number.isInteger(taskIndex) ||
    taskIndex < 0 ||
    taskIndex >= lesson.tasks.length
  ) {
    return;
  }

  await db
    .insert(taskProgress)
    .values({
      userId: session.user.id,
      lessonSlug: slug,
      taskIndex,
      status: passed ? "completed" : "in_progress",
      attempts: 1,
      completedAt: passed ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: [taskProgress.userId, taskProgress.lessonSlug, taskProgress.taskIndex],
      set: {
        attempts: sql`${taskProgress.attempts} + 1`,
        updatedAt: new Date(),
        ...(passed
          ? { status: "completed", completedAt: new Date() }
          : {}),
      },
    });

  if (passed) {
    // Refresh the catalog so the progress bars are not stale after going back.
    revalidatePath("/lekcje");
    revalidatePath("/profil");
  }
}
