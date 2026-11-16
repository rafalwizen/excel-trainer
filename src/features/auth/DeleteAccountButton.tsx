"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { deleteAccount } from "./actions";

// Two-step self-service account deletion (GDPR right to erasure):
// idle button -> inline confirmation panel asking for the password.
export function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await deleteAccount(password);
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    // The action already redirects to "/"; refresh makes the router cache
    // drop the logged-in shell right away.
    router.push("/");
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
      >
        Usuń konto
      </button>
    );
  }

  return (
    <form onSubmit={onDelete} className="mt-3 space-y-3">
      <p className="text-sm text-neutral-600">
        Tej operacji nie można cofnąć — konto zostanie trwale usunięte razem
        z całym postępem w nauce.
      </p>
      <div>
        <label
          htmlFor="delete-password"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Potwierdź hasłem
        </label>
        <input
          id="delete-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={pending}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-700/20"
        />
      </div>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-60"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-60"
        >
          {pending ? "Usuwanie…" : "Usuń konto na pewno"}
        </button>
      </div>
    </form>
  );
}
