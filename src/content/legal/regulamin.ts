import type { LegalDoc } from "./types";

// Regulamin serwisu (ustawa o świadczeniu usług drogą elektroniczną).
// When editing, keep the art. 8/9 uśude elements: service description,
// account terms, blocking procedure with notification, termination.
export const regulamin: LegalDoc = {
  title: "Regulamin serwisu Ćwicz Excel",
  updatedAt: "2026-11-16",
  sections: [
    {
      id: "postanowienia-ogolne",
      heading: "§ 1. Postanowienia ogólne",
      paragraphs: [
        "Niniejszy regulamin (dalej: Regulamin) określa zasady korzystania z serwisu Ćwicz Excel dostępnego pod adresem cwicz-excel.pl (dalej: Serwis), prawa i obowiązki stron oraz warunki zawierania i rozwiązywania umów o świadczenie usług drogą elektroniczną.",
        "Usługodawcą jest Rafał Wizen, prowadzący Serwis (dalej: Usługodawca). Kontakt z Usługodawcą: kontakt@cwicz-excel.pl.",
        "Ilekroć w Regulaminie mowa o: Usługowniku — rozumie się przez to osobę korzystającą z Serwisu; Koncie — rozumie się przez to unikalny zestaw danych identyfikujących Usługownika, umożliwiający korzystanie z dodatkowych funkcji Serwisu; uśude — rozumie się przez to ustawę z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.",
        "Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu.",
      ],
    },
    {
      id: "opis-uslugi",
      heading: "§ 2. Opis usługi",
      paragraphs: [
        "Serwis umożliwia naukę programu Microsoft Excel poprzez interaktywne lekcje i zadania wykonywane w arkuszu w przeglądarce internetowej.",
        "Większość lekcji jest dostępna bez założenia Konta. Konto pozwala na zapisywanie postępów w nauce i ich śledzenie na stronie profilu.",
        "Korzystanie z Serwisu, w tym założenie Konta, jest bezpłatne. Usługodawca zastrzega możliwość wprowadzenia w przyszłości funkcji płatnych — jeśli tak się stanie, informacja o cenach i warunkach będzie dostępna przed ich uruchomieniem.",
        "Usługodawca dokłada starań, aby Serwis działał nieprzerwanie, jednak nie gwarantuje dostępności ciągłej. Przerwy techniczne, konserwacyjne i modernizacyjne mogą występować, a Usługodawca będzie starał się informować o planowanych przerwach w Serwisie.",
      ],
    },
    {
      id: "konto",
      heading: "§ 3. Konto i rejestracja",
      paragraphs: [
        "Założenie Konta wymaga podania imienia, adresu e-mail oraz hasła o długości co najmniej 8 znaków, a także zaakceptowania Regulaminu.",
        "Założenie Konta stanowi zawarcie z Usługodawcą umowy o świadczenie usług drogą elektroniczną na czas nieoznaczony.",
        "Usługownik zobowiązuje się podawać prawdziwe dane oraz dołożenie staranności w ochronie hasła Konta. Usługownik ponosi odpowiedzialność za działania podjęte z użyciem jego Konta.",
        "Usługownik nie może udostępniać Konta osobom trzecim ani zakładać Konta w imieniu innej osoby bez jej zgody.",
        "Usługownik może w każdej chwili usunąć Konto zgodnie z § 6 Regulaminu.",
      ],
    },
    {
      id: "zasady-korzystania",
      heading: "§ 4. Zasady korzystania z Serwisu",
      paragraphs: [
        "Usługownik zobowiązuje się korzystać z Serwisu zgodnie z prawem, Regulaminem oraz dobrymi obyczajami.",
        "W szczególności zabronione jest: działanie na szkodę Serwisu lub Usługodawcy, automatyczne pobieranie treści w sposób obciążający serwery (np. boty, scraping), próby nieautoryzowanego dostępu do infrastruktury lub danych innych osób oraz podawanie danych wprowadzających w błąd.",
        "Usługownik ponosi odpowiedzialność za szkody wynikłe z naruszenia obowiązków opisanych w niniejszym paragrafie.",
      ],
    },
    {
      id: "blokada",
      heading: "§ 5. Blokada i ograniczenie dostępu",
      paragraphs: [
        "W przypadku naruszenia przez Usługownika Regulaminu, Usługodawca może zablokować Konto lub ograniczyć dostęp do Serwisu (art. 9 uśude).",
        "O zablokowaniu Konta Usługodawca poinformuje Usługownika drogą elektroniczną (na adres e-mail powiązany z Kontem) wraz z uzasadnieniem, chyba że okoliczności — w szczególności zagrożenie bezpieczeństwa Serwisu lub praw osób trzecich — sprawiają, że takie powiadomienie nie jest możliwe.",
        "Usługownik może odwołać się od blokady po adresem kontakt@cwicz-excel.pl. Odwołanie zostanie rozpatrzone bez zbędnej zwłoki.",
      ],
    },
    {
      id: "usuniecie-konta",
      heading: "§ 6. Wypowiedzenie umowy i usunięcie Konta",
      paragraphs: [
        "Usługownik może wypowiedzieć umowę i usunąć Konto w każdej chwili, samodzielnie, za pomocą funkcji „Usuń konto” na stronie profilu. Usunięcie Konta wymaga potwierdzenia hasłem i jest skuteczne natychmiast.",
        "Usunięcie Konta jest nieodwracalne: wraz z Kontem trwale usuwane są wszystkie powiązane dane, w tym zapisany postęp w nauce. Ponieważ usługa jest bezpłatna, z usunięciem Konta nie wiąże się zwrot jakichkolwiek świadczeń.",
        "Usługodawca może rozwiązać umowę z Usługownikiem z zachowaniem procedury określonej w § 5 Regulaminu.",
      ],
    },
    {
      id: "wlasnosc",
      heading: "§ 7. Własność intelektualna",
      paragraphs: [
        "Treści Serwisu — w tym lekcje, zadania, materiały edukacyjne, grafiki oraz nazwa Serwisu — podlegają ochronie prawnej, a autorskie prawa majątkowe są zastrzeżone.",
        "Usługownik może korzystać z treści Serwisu wyłącznie na własny użytek osobisty, w zakresie dozwolonym przez prawo. Kopiowanie, rozpowszechnianie lub wykorzystywanie komercyjne treści poza Serwisem wymaga uprzedniej zgody Usługodawcy.",
      ],
    },
    {
      id: "odpowiedzialnosc",
      heading: "§ 8. Odpowiedzialność",
      paragraphs: [
        "Serwis świadczony jest w stanie dostępnym na dzień korzystania z niego. Usługodawca nie gwarantuje, że Serwis będzie działał bez błędów, przerw ani że będzie dostępny nieprzerwanie.",
        "Treści edukacyjne przygotowane są z należytą starannością, jednak nie gwarantują one zgodności z każdą wersją programu Excel ani rezultatów w nauce.",
        "Usługodawca odpowiada za szkody wyrządzone Usługownikowi zgodnie z powszechnie obowiązującymi przepisami prawa.",
      ],
    },
    {
      id: "zmiany-regulaminu",
      heading: "§ 9. Zmiany Regulaminu",
      paragraphs: [
        "Usługodawca może zmienić Regulamin. O zamiarze zmiany Usługodawca poinformuje Usługowników w Serwisie co najmniej 7 dni przed wejściem zmian w życie; zmiany wymagane względami bezpieczeństwa lub przepisami prawa mogą zostać wprowadzone niezwłocznie.",
        "Kontynuowanie korzystania z Serwisu po wejściu zmian w życie oznacza ich akceptację. Brak zgody na zmiany uprawnia Usługownika do wypowiedzenia umowy przez usunięcie Konta (§ 6).",
      ],
    },
    {
      id: "prawo-i-kontakt",
      heading: "§ 10. Prawo właściwe i kontakt",
      paragraphs: [
        "W sprawach nieuregulowanych w Regulaminie zastosowanie mają przepisy prawa polskiego.",
        "Wszelkie pytania, zgłoszenia i postulaty dotyczące Serwisu prosimy kierować na adres: kontakt@cwicz-excel.pl.",
        "Sporów strony będą starały się rozstrzygać polubownie; w braku porozumienia właściwy będzie sąd według przepisów ogólnych.",
      ],
    },
  ],
};
