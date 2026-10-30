import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/AuthShell";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Zaloguj się — Excel Trainer",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Zaloguj się"
      subtitle="Wróć do swoich lekcji i kontynuuj naukę."
    >
      <LoginForm />
    </AuthShell>
  );
}
