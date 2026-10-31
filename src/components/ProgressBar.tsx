export function ProgressBar({
  completed,
  total,
  className = "",
}: {
  completed: number;
  total: number;
  className?: string;
}) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-neutral-200 ${className}`}
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Postęp: ${completed} z ${total} zadań`}
    >
      <div
        className={`h-full rounded-full transition-[width] ${
          percent === 100 ? "bg-green-600" : "bg-neutral-800"
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
