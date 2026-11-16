"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth";
import { auth } from "./auth";
import { authErrorMessage } from "./errors";

/**
 * Self-service account deletion (GDPR right to erasure, art. 17).
 * Requires the account password; on success the delete-user endpoint
 * removes the user row (FK cascades wipe sessions, credentials and task
 * progress) and clears the session cookie, then we redirect home.
 * redirect() throws, so the error return only covers failures.
 */
export async function deleteAccount(
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!password) {
    return { ok: false, error: "Podaj hasło, aby usunąć konto." };
  }
  try {
    await auth.api.deleteUser({
      body: { password },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return {
        ok: false,
        error: authErrorMessage(error.body?.code ?? null),
      };
    }
    throw error;
  }
  redirect("/");
}
