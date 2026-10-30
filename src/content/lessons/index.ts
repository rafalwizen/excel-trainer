import type { Lesson } from "../schema";
import { demoLesson } from "./demo";

/**
 * Lesson registry source. Adding a lesson = import it here;
 * catalog, routing and progress pick it up automatically.
 */
export const rawLessons: Lesson[] = [demoLesson];
