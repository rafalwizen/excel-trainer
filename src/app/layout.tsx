import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const title = "Excel Trainer — nauka Excela przez zadania";
const description =
  "Trenuj Excela na praktycznych zadaniach w arkuszu, który wygląda i działa jak prawdziwy. Śledź postęp, wybieraj tematy.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL ?? "http://localhost:3000"),
  title: {
    default: title,
    template: "%s",
  },
  description,
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/",
    siteName: "Excel Trainer",
    title,
    description,
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
