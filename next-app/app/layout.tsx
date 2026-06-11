import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LangPath — Language Learning",
    template: "%s | LangPath",
  },
  description: "Learn languages with reading, listening, dictation, grammar, and vocabulary lessons.",
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
