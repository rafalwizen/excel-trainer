import type { Lesson } from "../schema";
import { adresowanieWzgledneBezwzgledneLesson } from "./adresowanie-wzgledne-bezwzgledne";
import { formulyPodstawoweLesson } from "./formuly-podstawowe";
import { podstawyNawigacjiLesson } from "./podstawy-nawigacji";

/**
 * Lesson registry source. Adding a lesson = import it here;
 * catalog, routing and progress pick it up automatically.
 */
export const rawLessons: Lesson[] = [
  podstawyNawigacjiLesson,
  formulyPodstawoweLesson,
  adresowanieWzgledneBezwzgledneLesson,
];
