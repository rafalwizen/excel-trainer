import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/AuthShell";
import { RegisterForm } from "@/features/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Załóż konto",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Załóż konto"
      subtitle="Załóż darmowe konto i śledź swój postęp w nauce Excela."
    >
      <RegisterForm />
    </AuthShell>
  );
}
