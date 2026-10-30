import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth/auth";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
};

async function readSessionUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

/**
 * Current user or null — safe for public pages (renders "Zaloguj się" etc.).
 * `use cache: private` keeps the resolved session in the browser cache only,
 * so it never lands on the server but still enables prefetching.
 */
export async function getSessionUser(): Promise<CurrentUser | null> {
  "use cache: private";

  return readSessionUser();
}

/**
 * Current user or redirect to /logowanie — for protected pages.
 * redirect() throws, so only a resolved user gets cached.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  "use cache: private";

  const user = await readSessionUser();
  if (!user) redirect("/logowanie");
  return user;
}
