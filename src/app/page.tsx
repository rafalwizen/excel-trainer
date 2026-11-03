import { Fragment, Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { difficultyLabel } from "@/content/difficulty";
import { allLessons } from "@/content/registry";
import type { Lesson } from "@/content/schema";
import { plPlural } from "@/lib/plural";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const taskCount = allLessons.reduce((sum, lesson) => sum + lesson.tasks.length, 0);

const primaryAction =
  "rounded-lg bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800";
const secondaryAction =
  "rounded-lg border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-neutral-900">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <LessonsSection />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}

/** Mini sheet mark: a 3×3 cell grid with one green "selected" cell. */
function GridMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 7 + 1}
            y={row * 7 + 1}
            width="5"
            height="5"
            rx="1"
            fill={row === 1 && col === 1 ? "#15803d" : "#d4d4d4"}
          />
        )),
      )}
    </svg>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-neutral-900"
        >
          <GridMark />
          Excel Trainer
        </Link>
        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/lekcje"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 sm:block"
          >
            Lekcje
          </Link>
          <Link
            href="/logowanie"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            Zaloguj się
          </Link>
          <Link
            href="/rejestracja"
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Zarejestruj się
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 lg:py-24">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
            Trenuj Excela w prawdziwym arkuszu
          </h1>
          <p className="mt-5 text-lg leading-8 text-neutral-600">
            Zadania rozwiązujesz w edytorze, który wygląda i zachowuje się jak
            Excel: klikasz komórki, wpisujesz formuły i od razu widzisz wynik.
            Postęp zapisuje się na Twoim koncie.
          </p>
          <Suspense fallback={<HeroActions />}>
            <HeroActionsForUser />
          </Suspense>
          <p className="mt-6 text-sm text-neutral-500">
            {allLessons.length}{" "}
            {plPlural(allLessons.length, "lekcja", "lekcje", "lekcji")},{" "}
            {taskCount} {plPlural(taskCount, "zadanie", "zadania", "zadań")},
            bezpłatnie
          </p>
        </div>
        <SheetReplica />
      </div>
    </section>
  );
}

function HeroActions() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <Link href="/rejestracja" className={primaryAction}>
        Zacznij naukę
      </Link>
      <Link href="/lekcje" className={secondaryAction}>
        Zobacz lekcje
      </Link>
    </div>
  );
}

async function HeroActionsForUser() {
  // Private cache: returning users get a "continue" CTA streamed into the
  // prerendered logged-out shell.
  const user = await getSessionUser();
  if (!user) return <HeroActions />;
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <Link href="/lekcje" className={primaryAction}>
        Wróć do nauki
      </Link>
    </div>
  );
}

/**
 * Hand-built replica of the sheet from the first formulas lesson: same
 * table (Produkt/Cena), same SUM task, E1 selected with the formula in the
 * formula bar. No screenshot, no canvas — just CSS.
 */
function SheetReplica() {
  const th =
    "flex h-8 items-center justify-center border-b border-r border-neutral-200 bg-neutral-100 font-mono text-[11px] text-neutral-500";
  const thActive = "bg-green-50 font-medium text-green-700";
  const td =
    "flex h-8 items-center overflow-hidden whitespace-nowrap border-b border-r border-neutral-200 px-2 text-sm text-neutral-900";
  const selected =
    "bg-green-50/60 font-semibold text-green-800 ring-2 ring-inset ring-green-600";

  const rows: Array<Array<string | null>> = [
    ["Produkt", "Cena (zł)", null, "Suma (zł)", "61"],
    ["Kawa", "12", null, null, null],
    ["Herbata", "9", null, null, null],
    ["Kakao", "11", null, null, null],
    ["Sok", "29", null, null, null],
    [null, null, null, null, null],
  ];

  return (
    <div
      aria-hidden="true"
      className="w-full max-w-[560px] min-w-0 justify-self-center lg:justify-self-end"
    >
      <div className="overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
          <span className="w-14 shrink-0 rounded border border-neutral-200 bg-white px-2 py-0.5 text-center font-mono text-xs text-neutral-700">
            E1
          </span>
          <span className="shrink-0 font-mono text-xs italic text-neutral-400">
            fx
          </span>
          <span className="truncate font-mono text-sm text-neutral-900">
            =SUM(B2:B5)
            <span className="formula-caret" />
          </span>
        </div>
        <div className="overflow-x-auto">
          <div
            className="grid min-w-[29rem]"
            style={{
              gridTemplateColumns: "2.5rem 6.5rem 5rem 3rem 6.5rem 5.5rem",
            }}
          >
            <div className={th} />
            <div className={th}>A</div>
            <div className={th}>B</div>
            <div className={th}>C</div>
            <div className={th}>D</div>
            <div className={`${th} ${thActive}`}>E</div>
            {rows.map((cells, row) => (
              <Fragment key={row}>
                <div className={`${th} ${row === 0 ? thActive : ""}`}>
                  {row + 1}
                </div>
                {cells.map((value, col) => {
                  const isSelected = row === 0 && col === 4;
                  const isNumber = col === 1 || isSelected;
                  return (
                    <div
                      key={col}
                      className={`${td} ${isNumber ? "justify-end tabular-nums" : ""} ${isSelected ? selected : ""}`}
                    >
                      {value}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        Zadanie z lekcji „Formuły podstawowe” — tak wygląda trening.
      </p>
    </div>
  );
}

const steps = [
  {
    title: "Wybierz temat",
    text: "Od wpisywania danych po adresowanie bezwzględne — każda lekcja to kilka krótkich zadań.",
  },
  {
    title: "Rozwiąż zadanie w arkuszu",
    text: "Zadanie otwiera arkusz w przeglądarce. Klikasz komórki, wpisujesz dane i formuły tak jak w Excelu.",
  },
  {
    title: "Sprawdź się",
    text: "Przycisk „Sprawdź” ocenia Twój arkusz i podpowiada, co poprawić. Ukończone zadania zapisują się na koncie.",
  },
];

function HowItWorks() {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Jak to działa
        </h2>
        <div className="mt-8 grid gap-10 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title}>
              <span className="font-mono text-sm font-medium text-green-700">
                {index + 1}.
              </span>
              <h3 className="mt-2 font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LessonsSection() {
  // A taste of the catalog — the full, filterable list lives on /lekcje.
  const featured = allLessons.slice(0, 6);
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Lekcje na start
          </h2>
          <Link
            href="/lekcje"
            className="text-sm font-medium text-green-700 hover:underline"
          >
            Zobacz wszystkie {allLessons.length}{" "}
            {plPlural(allLessons.length, "lekcję", "lekcje", "lekcji")}
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((lesson) => (
            <LessonPreview key={lesson.slug} lesson={lesson} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LessonPreview({ lesson }: { lesson: Lesson }) {
  return (
    <Link
      href={`/lekcje/${lesson.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
    >
      <h3 className="font-semibold text-neutral-900 group-hover:underline">
        {lesson.title}
      </h3>
      <p className="text-sm leading-relaxed text-neutral-600">
        {lesson.shortDescription}
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-1 text-xs text-neutral-500">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className="text-amber-500"
            title={`Poziom ${difficultyLabel(lesson.difficulty)}`}
          >
            {"★".repeat(lesson.difficulty)}
            <span className="text-neutral-300">
              {"★".repeat(3 - lesson.difficulty)}
            </span>
          </span>
          <span>{difficultyLabel(lesson.difficulty)}</span>
          <span>
            {lesson.tasks.length}{" "}
            {plPlural(lesson.tasks.length, "zadanie", "zadania", "zadań")}
          </span>
        </span>
        <span>{lesson.category}</span>
      </div>
    </Link>
  );
}

function CtaBand() {
  return (
    <section className="bg-green-700">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Pierwsza lekcja zajmie kilkanaście minut
          </h2>
          <p className="mt-2 text-green-100">
            Konto jest bezpłatne — wystarczy e-mail.
          </p>
        </div>
        <Link
          href="/rejestracja"
          className="shrink-0 rounded-lg bg-white px-6 py-3 text-center text-sm font-semibold text-green-800 transition hover:bg-green-50"
        >
          Zarejestruj się
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Excel Trainer — nauka Excela przez zadania</p>
        <p>© 2026</p>
      </div>
    </footer>
  );
}
