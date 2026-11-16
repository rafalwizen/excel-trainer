# Dokumentacja zgodności prawnej — cwicz-excel.pl

Dokument wewnętrzny administratora (nie jest publikowany w serwisie).
Publiczne dokumenty: `/regulamin` i `/polityka-prywatnosci`
(treść w `src/content/legal/`). Stan na 2026-11-16.

## 1. Rejestr czynności przetwarzania (art. 30 RODO)

| Czynność | Dane | Podstawa | Odbiorcy / lokalizacja | Retencja |
|---|---|---|---|---|
| Rejestracja i utrzymanie konta | imię, e-mail, hash hasła (scrypt) | art. 6(1)(b) umowa | Cloudflare (przekazanie do USA, EU-US DPF), mikr.us VPS (PL) | do usunięcia konta |
| Sesje logowania | token sesji, IP, User-Agent | art. 6(1)(b) | jak wyżej | do wylogowania / wygaśnięcia (domyślnie better-auth) |
| Postęp w nauce (tabela `task_progress`) | lekcje/zadania, status, liczba prób, znaczniki czasu — powiązane z `user_id` | art. 6(1)(b) umowa | jak wyżej | do usunięcia konta (kaskada FK) |
| Logi techniczne kontenerów Docker | IP, czas, ścieżki żądań, błędy | art. 6(1)(f) bezpieczeństwo | mikr.us VPS (PL) | rotacja json-file: 10 MB × 3 pliki na usługę |
| DNS / CDN / ochrona L7 | IP, metadane żądań | art. 6(1)(f) | Cloudflare (processor) | wg polityki Cloudflare |

Usunięcie konta (`auth.api.deleteUser`, strona profilu) kasuje wiersz `user`;
FK `ON DELETE CASCADE` czyści `session`, `account`, `task_progress`.

## 2. Prawa osób (art. 15–21 RODO) — realizacja

- **Usunięcie (art. 17):** samoobsługa w profilu (hasło wymagane), natychmiast.
- **Pozostałe (dostęp, sprostowanie, ograniczenie, przenoszenie, sprzeciw):**
  zgłoszenie na kontakt@cwicz-excel.pl, termin 30 dni. Realizacja ręczna
  przez administratora (odczyt/korekta bezpośrednio w DB lub eksport SQL).
- Rejestr zgłoszeń: prowadzić ad hoc (skrzynka kontakt@); przy wzroście
  liczby żądań rozważyć tabelę zgłoszeń.

## 3. Procedura naruszenia ochrony danych (art. 33–34 RODO)

1. Wykrycie / podejrzenie naruszenia (np. wgłamanie, wyciek bazy, błędny dostęp).
2. Zabezpieczenie: izolacja VPS (snapshot, `docker compose --profile tunnel down`),
   rotacja sekretów (`POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, `TUNNEL_TOKEN`),
   reset haseł jeśli expose.
3. Ocena ryzyka dla osób; jeśli wysokie — zgłoszenie do PUOT w 72 h od stwierdzenia
   (formularz na uodo.gov.pl). Prowadzić wewnętrzną notatkę: co, kiedy, kto,
   zakres danych, skutki, środki.
4. Jeśli naruszenie grozi wysokim ryzyku osób — informacja poszkodowanych (art. 34).
5. Kopia zapasowa: brak automatycznych backupów (stan 2026-11-16) — ewentualny
   `pg_dump` przechowywać zaszyfrowany i usuwać po zużyciu.

## 4. Podmioty przetwarzające (art. 28 RODO) — checklista

| Podmiot | Rola | Umowa powierzenia | Status |
|---|---|---|---|
| Cloudflare, Inc. | DNS, CDN, tunel, ochrona | self-service DPA (cloudflare.com/DPA) + EU-US DPF | **do przyjęcia przez administratora** |
| mikr.us (hosting) | IaaS, PL | regulamin usługi — sprawdzić klauzulę powierzenia | **do weryfikacji / zapytania** |

## 5. Stosowanie innych regulacji — oceny

- **CRA (rozporządzenie (UE) 2024/2847):** nie stosuje się. Serwis to darmowa
  usługa online, nie produkt z elementami cyfrowymi „udostępniany na rynku"
  w ramach działalności handlowej (art. 2 ust. 2 wyłącza niekomercyjne).
  **Reassess przy:** płatnych planach, reklamach, dystrybucji kodu na licencji
  komercyjnej. Obowiązki producentów (raportowanie od 11.09.2026, reszta od
  10.12.2027) wtedy ewaluować od nowa.
- **NIS2:** brak — podmiot nie jest ani podmiotem kluczowym, ani ważnym.
- **DSA:** brak — serwis nie jest usługą pośredniczącą (brak UGC/hostingu dla
  osób trzecich).
- **PKE (cookies):** wyłącznie cookies ściśle konieczne (sesja, CSRF) —
  informacja w polityce prywatności wystarcza, zgoda i banner niewymagane.
  **Reassess przy:** dodaniu analityki/marketingu.

## 6. Środki bezpieczeństwa (art. 32 RODO)

HTTPS (Cloudflare Tunnel, TLS na edge), hasła tylko jako skrót scrypt,
sekrety w `.env` poza repozytorium (gitignore), ograniczona retencja logów
(rotacja compose), baza niedostępna z internetu (brak wystawionych portów DB).

## 7. Kalendarz przeglądów

- Przy każdej istotnej zmianie funkcji (nowe dane, nowy podmiot, płatności,
  analityka) — aktualizacja polityki prywatności (`updatedAt`), regulaminu
  (procedura z § 9) i tego dokumentu.
- Roczny przegląd rejestru czynności i DPA: listopad.
