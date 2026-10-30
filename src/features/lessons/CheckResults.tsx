import type { CheckResults as CheckResultsType } from "@/lib/validators/types";

export function CheckResultsPanel({ results }: { results: CheckResultsType }) {
  if (results.passed) {
    return (
      <div
        role="status"
        className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
      >
        Wszystko poprawnie! Zadanie zaliczone. 🎉
      </div>
    );
  }

  const failed = results.results.filter((r) => !r.ok);
  return (
    <div
      role="alert"
      className="space-y-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
    >
      <p className="text-sm font-medium text-red-800">
        Jeszcze niezupełnie — popraw następujące rzeczy:
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
        {failed.map((r, i) =>
          r.ok ? null : <li key={i}>{r.message}</li>,
        )}
      </ul>
    </div>
  );
}
