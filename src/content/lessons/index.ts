import type { LessonInput } from "../schema";
import { adresowanieWzgledneBezwzgledneLesson } from "./adresowanie-wzgledne-bezwzgledne";
import { budowaTabeliDanychLesson } from "./budowa-tabeli-danych";
import { formatowanieCzcionekIKolorowLesson } from "./formatowanie-czcionek-i-kolorow";
import { formatowanieLiczbLesson } from "./formatowanie-liczb";
import { funkcjeStatystyczneLesson } from "./funkcje-statystyczne";
import { formulyPodstawoweLesson } from "./formuly-podstawowe";
import { podstawyNawigacjiLesson } from "./podstawy-nawigacji";
import { wierszeIKolumnyLesson } from "./wiersze-i-kolumny";
import { wpisywanieIPoprawianieDanychLesson } from "./wpisywanie-i-poprawianie-danych";
import { wypelnianieSeriamiLesson } from "./wypelnianie-seriami";
import { zaokraglanieIPrecyzjaLesson } from "./zaokraglanie-i-precyzja";

/**
 * Lesson registry source. Adding a lesson = import it here;
 * catalog, routing and progress pick it up automatically.
 * Array order = catalog order (curriculum order).
 */
export const rawLessons: LessonInput[] = [
  podstawyNawigacjiLesson,
  wpisywanieIPoprawianieDanychLesson,
  wierszeIKolumnyLesson,
  wypelnianieSeriamiLesson,
  budowaTabeliDanychLesson,
  formatowanieCzcionekIKolorowLesson,
  formatowanieLiczbLesson,
  zaokraglanieIPrecyzjaLesson,
  formulyPodstawoweLesson,
  funkcjeStatystyczneLesson,
  adresowanieWzgledneBezwzgledneLesson,
];
