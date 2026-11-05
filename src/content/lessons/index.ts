import type { LessonInput } from "../schema";
import { adresowanieWzgledneBezwzgledneLesson } from "./adresowanie-wzgledne-bezwzgledne";
import { budowaTabeliDanychLesson } from "./budowa-tabeli-danych";
import { czyszczenieDanychLesson } from "./czyszczenie-danych";
import { daneWieleArkuszyLesson } from "./dane-wiele-arkuszy";
import { datyPodstawyLesson } from "./daty-podstawy";
import { filtrowanieIFunkcjeTablicoweLesson } from "./filtrowanie-i-funkcje-tablicowe";
import { formatowanieCzcionekIKolorowLesson } from "./formatowanie-czcionek-i-kolorow";
import { formatowanieLiczbLesson } from "./formatowanie-liczb";
import { funkcjeLogiczneLesson } from "./funkcje-logiczne";
import { funkcjeStatystyczneLesson } from "./funkcje-statystyczne";
import { formulyPodstawoweLesson } from "./formuly-podstawowe";
import { indeksPodajPozycjeLesson } from "./indeks-podaj-pozycje";
import { jezeliBladLesson } from "./jezeli-blad";
import { jezeliWielokrotneLesson } from "./jezeli-wielokrotne";
import { konsolidacjaRaportowLesson } from "./konsolidacja-raportow";
import { logikaJezeliLesson } from "./logika-jezeli";
import { podstawyNawigacjiLesson } from "./podstawy-nawigacji";
import { sortowanieIOrganizacjaLesson } from "./sortowanie-i-organizacja";
import { sredniaJezeliLesson } from "./srednia-jezeli";
import { sumaJezeliLesson } from "./suma-jezeli";
import { sumaWarunkowZaawansowanaLesson } from "./suma-warunkow-zaawansowana";
import { tekstPodstawyLesson } from "./tekst-podstawy";
import { tekstZaawansowanyLesson } from "./tekst-zaawansowany";
import { wierszeIKolumnyLesson } from "./wiersze-i-kolumny";
import { wpisywanieIPoprawianieDanychLesson } from "./wpisywanie-i-poprawianie-danych";
import { wypelnianieSeriamiLesson } from "./wypelnianie-seriami";
import { wyszukajPionowoLesson } from "./wyszukaj-pionowo";
import { xlookupWyszukiwanieNowoczesneLesson } from "./xlookup-wyszukiwanie-nowoczesne";
import { zaokraglanieIPrecyzjaLesson } from "./zaokraglanie-i-precyzja";
import { zliczaniePowtorzenLesson } from "./zliczanie-powtorzen";

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
  logikaJezeliLesson,
  funkcjeLogiczneLesson,
  sumaJezeliLesson,
  sredniaJezeliLesson,
  jezeliBladLesson,
  wyszukajPionowoLesson,
  tekstPodstawyLesson,
  datyPodstawyLesson,
  sortowanieIOrganizacjaLesson,
  zliczaniePowtorzenLesson,
  xlookupWyszukiwanieNowoczesneLesson,
  indeksPodajPozycjeLesson,
  jezeliWielokrotneLesson,
  tekstZaawansowanyLesson,
  sumaWarunkowZaawansowanaLesson,
  daneWieleArkuszyLesson,
  konsolidacjaRaportowLesson,
  filtrowanieIFunkcjeTablicoweLesson,
  czyszczenieDanychLesson,
];
