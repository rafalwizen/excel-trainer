import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema";

export const auth = betterAuth({
  // Public origin (no trailing slash) — matches cookie/trustedOrigins in prod.
  baseURL: process.env.BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    // Enables the self-service delete-user endpoint: it verifies the account
    // password, removes the user row (cascades wipe sessions, credentials and
    // task progress) and clears the session cookie. Used by the deleteAccount
    // server action for the GDPR right to erasure. Do NOT configure
    // sendDeleteAccountVerification — there is no mailer, and it would switch
    // the endpoint to email-token mode.
    deleteUser: {
      enabled: true,
    },
  },
});
