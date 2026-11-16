import type { LegalDoc } from "./types";

// Polityka prywatności — art. 13 RODO information notice. When editing,
// keep every element present: controller + contact, data categories,
// purposes/legal bases, recipients, non-EEG transfers, retention, data
// subject rights incl. complaint to PUOT, cookies info.
export const politykaPrywatnosci: LegalDoc = {
  title: "Polityka prywatności",
  updatedAt: "2026-11-16",
  sections: [
    {
      id: "administrator",
      heading: "Administrator danych",
      paragraphs: [
        "Administratorem Twoich danych osobowych w serwisie Ćwicz Excel (cwicz-excel.pl, dalej: Serwis) jest Rafał Wizen (dalej: Administrator).",
        "Kontakt w sprawach ochrony danych osobowych: kontakt@cwicz-excel.pl.",
      ],
    },
    {
      id: "jakie-dane",
      heading: "Jakie dane przetwarzamy",
      paragraphs: [
        "Jeśli korzystasz z lekcji bez zakładania konta, nie przetwarzamy żadnych danych osobowych — postęp w nauce nie jest wtedy zapisywany.",
        "Jeśli zakładasz konto, przetwarzamy: imię oraz adres e-mail podane przy rejestracji; hasło — wyłącznie w formie skrótu kryptograficznego (nie przechowujemy hasła w postaci jawnej); dane sesji: adres IP i identyfikator przeglądarki (User-Agent); postęp w nauce: oznaczenia lekcji i zadań, ich status, liczbę prób oraz znaczniki czasu.",
      ],
    },
    {
      id: "cele-i-podstawy",
      heading: "Cele i podstawy prawne przetwarzania",
      paragraphs: [
        "Zawarcie i wykonywanie umowy o świadczenie usługi (art. 6 ust. 1 lit. b RODO): rejestracja i utrzymanie konta oraz zapamiętywanie postępów w nauce. Podanie imienia, adresu e-mail i hasła jest dobrowolne, ale niezbędne do założenia konta.",
        "Prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO): zapewnienie bezpieczeństwa i prawidłowego działania Serwisu — uwierzytelnianie sesji, prowadzenie technicznych logów serwera oraz zapobieganie nadużyciom.",
      ],
    },
    {
      id: "odbiorcy",
      heading: "Odbiorcy danych i powierzenie przetwarzania",
      paragraphs: [
        "Nie sprzedajemy Twoich danych osobowych ani nie udostępniamy ich podmiotom trzecim w celach marketingowych lub analitycznych.",
        "Niektóre podmioty przetwarzają Twoje dane na nasze polecenie, w zakresie niezbędnym do działania Serwisu (umowy powierzenia, art. 28 RODO): Cloudflare, Inc. — usługi DNS, sieci dostarczania treści (CDN) i ochrony przed nadużyciami; operator serwera VPS (hosting) — firma mikr.us, z serwerami zlokalizowanymi w Polsce.",
      ],
    },
    {
      id: "przekazywanie",
      heading: "Przekazywanie danych poza Europejski Obszar Gospodarczy",
      paragraphs: [
        "Dane przekazywane są do Cloudflare, Inc. z siedzibą w Stanach Zjednoczonych (DNS/CDN). Podstawą przekazania jest certyfikat EU-US Data Privacy Framework, zapewniający poziom ochrony danych odpowiadający wymogom RODO.",
        "Dane przechowywane na serwerze hostingowym nie opuszczają Europejskiego Obszaru Gospodarczego.",
      ],
    },
    {
      id: "retencja",
      heading: "Jak długo przechowujemy dane",
      paragraphs: [
        "Dane konta i postępy w nauce: do momentu usunięcia konta, które możesz wykonać samodzielnie w każdej chwili na stronie profilu.",
        "Dane sesji: do wylogowania lub wygaśnięcia sesji.",
        "Techniczne logi serwera: przez okres niezbędny do zapewnienia bezpieczeństwa, ograniczony automatyczną rotacją logów.",
        "Po usunięciu konta wszystkie powiązane dane (dane konta, sesje, postępy) są trwale usuwane z bazy danych.",
      ],
    },
    {
      id: "prawa",
      heading: "Twoje prawa",
      paragraphs: [
        "Zgodnie z RODO przysługują Ci: prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz — gdy podstawą przetwarzania jest uzasadniony interes — prawo sprzeciwu.",
        "Najszybszym sposobem realizacji prawa do usunięcia jest funkcja „Usuń konto” na stronie profilu — działa natychmiast i nie wymaga kontaktu.",
        "Żądania dotyczące pozostałych praw prosimy kierować na adres kontakt@cwicz-excel.pl. Realizujemy je w terminie do 30 dni od otrzymania zgłoszenia.",
        "Masz także prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa, www.uodo.gov.pl), jeśli uznasz, że przetwarzanie Twoich danych narusza RODO.",
      ],
    },
    {
      id: "cookies",
      heading: "Pliki cookies",
      paragraphs: [
        "Serwis używa wyłącznie plików cookies niezbędnych do jego działania: cookies sesyjnych better-auth (utrzymanie sesji po zalogowaniu) oraz cookies ochrony przed atakami CSRF. Nie stosujemy cookies analitycznych, reklamowych ani profilujących, dlatego nie wyświetlamy banera zgody.",
        "Możesz wyłączyć cookies w ustawieniach przeglądarki; może to jednak uniemożliwić zalogowanie się do Serwisu.",
      ],
    },
    {
      id: "profilowanie",
      heading: "Zautomatyzowane decyzje i profilowanie",
      paragraphs: [
        "Nie stosujemy zautomatyzowanego podejmowania decyzji ani profilowania w rozumieniu RODO. Twoje dane nie służą do tworzenia profili behawioralnych.",
      ],
    },
    {
      id: "dzieci",
      heading: "Dane dzieci",
      paragraphs: [
        "Serwis nie jest skierowany do osób poniżej 16. roku życia. Nie zbieramy świadomie danych osób poniżej tego wieku; jeśli się pojawią, usuwamy je niezwłocznie po wykryciu.",
      ],
    },
    {
      id: "bezpieczenstwo",
      heading: "Bezpieczeństwo danych",
      paragraphs: [
        "Stosujemy środki techniczne i organizacyjne zgodne z art. 32 RODO: szyfrowanie transmisji (HTTPS), przechowywanie haseł wyłącznie w postaci skrótów kryptograficznych, przechowywanie sekretów poza kodem aplikacji oraz ograniczoną retencję logów.",
      ],
    },
    {
      id: "zmiany",
      heading: "Zmiany polityki prywatności",
      paragraphs: [
        "Polityka może być aktualizowana, np. gdy zmienią się przetwarzane dane lub przepisy. Aktualna wersja jest zawsze publikowana na tej stronie wraz z datą ostatniej aktualizacji; o istotnych zmianach poinformujemy w Serwisie.",
      ],
    },
  ],
};
