import type { Metadata } from "next";
import { LegalDocPage } from "@/components/LegalDocPage";
import { regulamin } from "@/content/legal/regulamin";

export const metadata: Metadata = {
  title: "Regulamin",
  description:
    "Regulamin serwisu Ćwicz Excel: zasady korzystania, konto, blokada dostępu, usuwanie konta, własność intelektualna.",
  alternates: { canonical: "/regulamin" },
};

export default function RegulaminPage() {
  return <LegalDocPage doc={regulamin} />;
}
