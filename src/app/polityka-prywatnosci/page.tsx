import type { Metadata } from "next";
import { LegalDocPage } from "@/components/LegalDocPage";
import { politykaPrywatnosci } from "@/content/legal/polityka-prywatnosci";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Polityka prywatności serwisu Ćwicz Excel: jakie dane przetwarzamy, cele i podstawy prawne, odbiorcy, retencja, Twoje prawa (RODO).",
  alternates: { canonical: "/polityka-prywatnosci" },
};

export default function PolitykaPrywatnosciPage() {
  return <LegalDocPage doc={politykaPrywatnosci} />;
}
