import Link from "next/link";
import type { LegalDoc } from "@/content/legal/types";

// Static renderer for legal documents (regulamin, privacy policy).
// Must stay free of headers()/cookies/DB access so cacheComponents can
// fully prerender the pages without a Suspense boundary.
export function LegalDocPage({
  doc,
  backHref = "/",
}: {
  doc: LegalDoc;
  backHref?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            href={backHref}
            className="rounded-lg px-2 py-1 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Wróć na stronę główną"
          >
            ←
          </Link>
          <span className="text-sm font-semibold text-neutral-900">
            Ćwicz Excel
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {doc.title}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Data ostatniej aktualizacji: {doc.updatedAt}
        </p>
        <article className="mt-8">
          {doc.sections.map((section) => (
            <section
              key={section.id}
              aria-labelledby={section.id}
              className="mt-10 first:mt-0"
            >
              <h2
                id={section.id}
                className="scroll-mt-20 text-xl font-semibold text-neutral-900"
              >
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-7 text-neutral-700">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
