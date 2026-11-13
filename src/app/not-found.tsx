import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 text-center">
      <p className="font-mono text-sm text-green-700">#ADR! — błąd adresu</p>
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Nie znaleziono strony
      </h1>
      <p className="max-w-md text-sm leading-6 text-neutral-600">
        Ten adres nie istnieje albo strona została przeniesiona. Może lekcja,
        której szukasz, czeka w katalogu?
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/lekcje"
          className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          Zobacz lekcje
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
        >
          Strona główna
        </Link>
      </div>
    </div>
  );
}
